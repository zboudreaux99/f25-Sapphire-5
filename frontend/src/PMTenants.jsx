import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Accordion from "react-bootstrap/Accordion";
import Form from "react-bootstrap/Form";

function PMTenants({ show, handleClose }) {
    const [tenants, setTenants] = useState([]);
    const [addingTenant, setAddingTenant] = useState(false);
    const [newTenant, setNewTenant] = useState({ tenant_name: "", unit_name: "" });

    // Fetch tenants when modal opens
    useEffect(() => {
        if (show) {
            fetch("http://localhost:8080/api/property/unit/tenant?unit_id=1")
                .then((res) => res.json())
                .then((data) => setTenants(data))
                .catch((err) => console.error(err));
        }
    }, [show]);

    const handleAddClick = () => {
        setAddingTenant(true);
        setNewTenant({ tenant_name: "", unit_name: "" });
    };

    const handleSaveNewTenant = () => {
        if (!newTenant.tenant_name || !newTenant.unit_name) return alert("Please fill out all fields");

        const tenantToAdd = {
            tenant_id: Date.now(),
            tenant_name: newTenant.tenant_name,
            unit_name: newTenant.unit_name,
            property_name: "The Grand Apartments",
            complaints_initiated: "0",
        };

        setTenants((prev) => [...prev, tenantToAdd]);
        setAddingTenant(false);
    };

    const handleRemoveTenant = (tenantId) => {
        setTenants((prev) => prev.filter((t) => t.tenant_id !== tenantId));
    };

    return (
        <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} className="blur-background">
            <Modal.Header closeButton>
                <Modal.Title>Tenants</Modal.Title>
            </Modal.Header>

            <Modal.Body>

                {addingTenant ? (
                    <Form className="mb-3">
                        <Form.Group className="mb-2">
                            <Form.Label>Tenant Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter tenant name"
                                value={newTenant.tenant_name}
                                onChange={(e) => setNewTenant({ ...newTenant, tenant_name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Label>Unit Number</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter unit number"
                                value={newTenant.unit_name}
                                onChange={(e) => setNewTenant({ ...newTenant, unit_name: e.target.value })}
                            />
                        </Form.Group>
                        <Button variant="success" onClick={handleSaveNewTenant} className="me-2">
                            Save
                        </Button>
                        <Button variant="secondary" onClick={() => setAddingTenant(false)}>
                            Cancel
                        </Button>
                    </Form>
                ) : (
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="primary" onClick={handleAddClick}>
                            + Add Tenant
                        </Button>
                    </div>
                )}

                <Accordion>
                    {tenants.map((tenant, idx) => (
                        <Accordion.Item eventKey={idx.toString()} key={tenant.tenant_id}>
                            <Accordion.Header>{tenant.tenant_name}</Accordion.Header>
                            <Accordion.Body>
                                <p>Unit: {tenant.unit_name}</p>
                                <p>Property: {tenant.property_name}</p>
                                <p>Complaints: {tenant.complaints_initiated}</p>
                                <Button
                                    variant="danger"
                                    size="sm"
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
