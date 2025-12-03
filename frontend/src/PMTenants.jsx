import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";

/**
 * Retrieves and holds the tenant data entered by the property manager.
 *
 * @param show Allows for the modal to be visible.
 * @param handleClose Specifies a function to run when the modal is requested to not be visible.
 * 
 * @return The state of the modal.
 */
function PMTenants({ show, handleClose }) {
    const [tenants, setTenants] = useState([]);
    const [units, setUnits] = useState([]);
    const [addingTenant, setAddingTenant] = useState(false);
    const [newTenant, setNewTenant] = useState({ tenant_name: "", unit_id: null });

    const property_id = 1;

    const normalizeUnits = (raw) => {
        return raw.map((u, idx) => {
            const unit_id = Number(u.unit_id ?? u.unitid ?? u.id);
            const unit_name = u.unit_name ?? u.name;
            return { unit_id, unit_name };
        });
    };

    // Sends request to backend to Load tenants and units.
    const loadTenants = async () => {
        try {
            // Units for dropdown.
            const unitsRes = await fetch(
                `http://localhost:8080/api/property/unit/units?property_id=${property_id}`
            );
            const fixedUnits = normalizeUnits(await unitsRes.json());
            setUnits(fixedUnits);

            // Tenants for display.
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

    // Sends backend reqest to save data of new tenant.
    const handleSaveNewTenant = async () => {
        if (!newTenant.tenant_name || !newTenant.unit_id) {
            alert("Please fill out all fields");
            return;
        }

        const payload = {
            user_id: 1, // Keep using the same user_id for simple tenants.
            name: newTenant.tenant_name,
            unit_id: Number(newTenant.unit_id)
        };

        try {
            const res = await fetch("http://localhost:8080/api/property/unit/tenant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            let body = null;
            try {
                body = await res.json();
            } catch (e) {
                console.warn("POST had no JSON body");
            }

            if (!res.ok) {
                console.error("POST failed:", body);

                alert("A tenant is already assigned to this unit.");

                return;
            }

            await loadTenants(); // Reload tenant list.
            setAddingTenant(false);
            setNewTenant({ tenant_name: "", unit_id: null });

        } catch (err) {
            console.error("handleSaveNewTenant ERROR:", err);
            alert("Failed to add tenant.");
        }
    };


    // Sends backend request to remove the tenant.
    const handleRemoveTenant = async (tenantId) => {
        try {
            const res = await fetch("http://localhost:8080/api/property/unit/tenant/remove", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tenant_id: tenantId })
            });
            await res.json();
            await loadTenants(); // Reload tenant list after removal.
        } catch (err) {
            console.error("handleRemoveTenant ERROR:", err);
        }
    };

    // Returns the modal with save, loading, and deleting features of tenants for the property manager.
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
                                onChange={(e) => setNewTenant({ ...newTenant, tenant_name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Unit</Form.Label>
                            <Form.Select
                                value={newTenant.unit_id ?? ""}
                                onChange={(e) => {
                                    const num = Number(e.target.value);
                                    setNewTenant({ ...newTenant, unit_id: isNaN(num) ? null : num });
                                }}
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
                                setNewTenant({ tenant_name: "", unit_id: null });
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
                        <Accordion.Item eventKey={idx.toString()} key={tenant.tenant_id}>
                            <Accordion.Header>{tenant.tenant_name}</Accordion.Header>
                            <Accordion.Body>
                                <p><strong>Unit:</strong> {tenant.unit_name}</p>
                                <p><strong>Property:</strong> {tenant.property_name}</p>
                                <p><strong>Complaints:</strong> {tenant.complaints_initiated}</p>

                                <Button size="sm" variant="danger" onClick={() => handleRemoveTenant(tenant.tenant_id)}>
                                    Remove Tenant
                                </Button>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PMTenants;
