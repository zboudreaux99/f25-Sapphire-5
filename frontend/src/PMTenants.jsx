import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";

function PMTenants({ show, handleClose }) {
    const [tenants, setTenants] = useState([]);
    const [units, setUnits] = useState([]);
    const [addingTenant, setAddingTenant] = useState(false);
    const [newTenant, setNewTenant] = useState({ tenant_name: "", unit_id: "" });

    const property_id = 1;

    // Load tenants and units
    const loadTenants = async () => {
        try {
            // Units for dropdown
            const unitsRes = await fetch(
                `http://localhost:8080/api/property/unit/units?property_id=${property_id}`
            );
            const unitsData = await unitsRes.json();
            setUnits(unitsData);

            // Tenants for display
            const tenantsRes = await fetch(
                `http://localhost:8080/api/property/unit/tenants?property_id=${property_id}`
            );
            const tenantsData = await tenantsRes.json();
            setTenants(tenantsData);
        } catch (e) {
            console.error("Error loading tenant data:", e);
        }
    };

    useEffect(() => {
        if (show) loadTenants();
    }, [show]);

    const handleSaveNewTenant = async () => {
        if (!newTenant.tenant_name || !newTenant.unit_id) {
            return alert("Please fill out all fields");
        }

        try {
            await fetch("http://localhost:8080/api/property/unit/tenant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: 1,
                    name: newTenant.tenant_name,
                    unit_id: newTenant.unit_id
                })
            });

            await loadTenants(); // reload tenant list
            setAddingTenant(false);
            setNewTenant({ tenant_name: "", unit_id: "" }); // clear form
        } catch (e) {
            console.error("Error saving tenant:", e);
        }
    };

    const handleRemoveTenant = async (tenantId) => {
        try {
            await fetch("http://localhost:8080/api/property/unit/tenant/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenant_id: tenantId })
            });

            await loadTenants(); // reload tenant list after removal
        } catch (e) {
            console.error("Error removing tenant:", e);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Tenants</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                {addingTenant ? (
                    <Form>
                        <Form.Group className="mb-2">
                            <Form.Label>Tenant Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={newTenant.tenant_name}
                                onChange={(e) =>
                                    setNewTenant({ ...newTenant, tenant_name: e.target.value })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Unit</Form.Label>
                            <Form.Select
                                value={newTenant.unit_id}
                                onChange={(e) =>
                                    setNewTenant({ ...newTenant, unit_id: e.target.value })
                                }
                            >
                                <option value="">Select a unit</option>
                                {units.map((u) => (
                                    <option key={u.unit_id} value={u.unit_id}>
                                        {u.unit_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Button variant="success" onClick={handleSaveNewTenant} className="me-2">
                            Save
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setAddingTenant(false);
                                setNewTenant({ tenant_name: "", unit_id: "" });
                            }}
                        >
                            Cancel
                        </Button>
                    </Form>
                ) : (
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="primary" onClick={() => setAddingTenant(true)}>
                            + Add Tenant
                        </Button>
                    </div>
                )}

                <Accordion>
                    {tenants.map((tenant, idx) => (
                        <Accordion.Item eventKey={idx} key={tenant.tenant_id}>
                            <Accordion.Header>{tenant.tenant_name}</Accordion.Header>
                            <Accordion.Body>
                                <p><strong>Unit:</strong> {tenant.unit_name}</p>
                                <p><strong>Property:</strong> {tenant.property_name}</p>
                                <p><strong>Complaints:</strong> {tenant.complaints_initiated}</p>

                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => handleRemoveTenant(tenant.tenant_id)}
                                >
                                    Remove Tenant
                                </Button>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PMTenants;
