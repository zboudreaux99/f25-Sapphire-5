import { useEffect, useState } from "react";
import { Form, Button, Collapse, ListGroup } from "react-bootstrap";

/**
 * UnitRewardManager function
 *  Allows a property manager to manage rewards by units, including:
 *  - Creating new rewards (name and description).
 *  - Assigning rewards by units.
 *  - Viewing assigned rewards per unit.
 *
 * @param {number} [propertyId = 1] - ID of the property for which rewards and units are managed.
 * 
 * @returns {JSX.Element} Reward management interface.
 */
function UnitRewardManager({ propertyId = 1 }) {
    const [rewards, setRewards] = useState([]);
    const [units, setUnits] = useState([]);
    const [unitRewards, setUnitRewards] = useState([]);
    const [newRewardName, setNewRewardName] = useState("");
    const [newRewardDescription, setNewRewardDescription] = useState("");
    const [selectedReward, setSelectedReward] = useState("");
    const [selectedUnit, setSelectedUnit] = useState("");
    const [message, setMessage] = useState("");
    const [showRewards, setShowRewards] = useState(false);
    const [openUnits, setOpenUnits] = useState({}); // per-unit collapse state

    // Fetch rewards.
    const fetchRewards = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/property/rewards?property_id=${propertyId}`);
            if (!res.ok) throw new Error("Failed to fetch rewards");
            const data = await res.json();
            setRewards(data);
        } catch (err) {
            console.error(err);
            setMessage("Failed to load rewards.");
        }
    };

    // Fetch units.
    const fetchUnits = async () => {
        try {
            const res = await fetch(`http://localhost:8080/api/property/unit/units?property_id=${propertyId}`);
            if (!res.ok) throw new Error("Failed to fetch units");
            const data = await res.json();
            setUnits(data);
        } catch (err) {
            console.error(err);
            setMessage("Failed to load units.");
        }
    };

    // Fetch assigned rewards.
    const fetchUnitRewards = async () => {
        try {
            const allRewards = [];
            for (const unit of units) {
                const res = await fetch(`http://localhost:8080/api/property/unit/rewards?unit_id=${unit.unit_id}`);
                const data = await res.json();
                if (Array.isArray(data)) {
                    allRewards.push(...data.map(r => ({ ...r, unit_id: unit.unit_id })));
                }
            }
            setUnitRewards(allRewards);
        } catch (err) {
            console.error(err);
            setMessage("Failed to load assigned rewards.");
        }
    };

    useEffect(() => {
        fetchRewards();
        fetchUnits();
    }, [propertyId]);

    useEffect(() => {
        if (units.length > 0) fetchUnitRewards();
    }, [units]);

    // Create new reward.
    const handleCreateReward = async () => {
        if (!newRewardName || !newRewardDescription) return;
        try {
            const res = await fetch(`http://localhost:8080/api/property/rewards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property_id: propertyId,
                    name: newRewardName,
                    description: newRewardDescription
                })
            });
            if (!res.ok) throw new Error("Failed to create reward");
            setNewRewardName("");
            setNewRewardDescription("");
            setMessage("Reward created successfully!");
            fetchRewards();
        } catch (err) {
            console.error(err);
            setMessage("Error creating reward.");
        }
    };

    // Assign reward to selected unit.
    const handleAssignReward = async () => {
        if (!selectedReward || !selectedUnit) {
            setMessage("Please select both reward and unit.");
            return;
        }
        try {
            const res = await fetch(`http://localhost:8080/api/property/unit/rewards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    property_id: propertyId,
                    unit_id: selectedUnit,
                    reward_id: selectedReward
                })
            });
            if (!res.ok) throw new Error("Failed to assign reward");
            setSelectedReward("");
            setSelectedUnit("");
            setMessage("Reward assigned successfully!");
            fetchUnitRewards();
        } catch (err) {
            console.error(err);
            setMessage("Error assigning reward.");
        }
    };

    const toggleUnit = (unitId) => {
        setOpenUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
    };

    return (
        <div className="mb-3">
            <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowRewards(!showRewards)}
                className="mb-2"
            >
                {showRewards ? "Hide Manage Rewards" : "Manage Rewards"}
            </Button>

            <Collapse in={showRewards}>
                <div className="p-3 liquid-glass rounded">


                    {/* Create Reward */}
                    <h6>Create New Reward</h6>
                    <div className="d-flex gap-2 mb-2">
                        <Form.Control
                            size="sm"
                            placeholder="Reward Name"
                            value={newRewardName}
                            onChange={(e) => setNewRewardName(e.target.value)}
                        />
                        <Form.Control
                            size="sm"
                            placeholder="Reward Description"
                            value={newRewardDescription}
                            onChange={(e) => setNewRewardDescription(e.target.value)}
                        />
                    </div>
                    <Button size="sm" variant="success" className="mb-3" onClick={handleCreateReward}>
                        Create Reward
                    </Button>


                    {/* Assign Reward */}
                    <h6>Assign Reward to Unit</h6>
                    <div className="d-flex gap-2 mb-2">
                        <Form.Select
                            size="sm"
                            value={selectedReward}
                            onChange={(e) => setSelectedReward(e.target.value)}
                        >
                            <option value="">Select reward</option>
                            {rewards.map((reward) => (
                                <option key={reward.reward_id} value={reward.reward_id}>
                                    {reward.reward_name}
                                </option>
                            ))}
                        </Form.Select>

                        <Form.Select
                            size="sm"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                            <option value="">Select unit</option>
                            {units.map((unit) => (
                                <option key={unit.unit_id} value={unit.unit_id}>
                                    {unit.unit_name}
                                </option>
                            ))}
                        </Form.Select>
                    </div>
                    <Button size="sm" variant="success" className="mb-3" onClick={handleAssignReward}>
                        Assign Reward
                    </Button>

                    {/* Assigned Rewards */}
                    <h6>Assigned Rewards</h6>
                    <ListGroup size="sm">
                        {units.map((unit) => {
                            const assigned = unitRewards
                                .filter(ur => ur.unit_id === unit.unit_id)
                                .map(ur => ur.reward_name)
                                .join(", ") || "None";
                            return (
                                <div key={unit.unit_id}>
                                    <ListGroup.Item
                                        action
                                        onClick={() => toggleUnit(unit.unit_id)}
                                        aria-controls={`unit-collapse-${unit.unit_id}`}
                                        aria-expanded={openUnits[unit.unit_id] || false}
                                    >
                                        {unit.unit_name}
                                    </ListGroup.Item>
                                    <Collapse in={openUnits[unit.unit_id]}>
                                        <div id={`unit-collapse-${unit.unit_id}`} className="ps-3 pt-1 pb-2 text-white">
                                            {assigned}
                                        </div>
                                    </Collapse>
                                </div>
                            );
                        })}
                    </ListGroup>

                    {/* Messages will appear here */}
                    {message && <div className="mt-2 text-white">{message}</div>}
                </div>
            </Collapse>
        </div>
    );
}

export default UnitRewardManager;
