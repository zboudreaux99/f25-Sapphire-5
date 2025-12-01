import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Accordion from 'react-bootstrap/Accordion';
import Form from 'react-bootstrap/Form';


/**
 * PMUnits function
 *  Displays a modal for managing units of a property.
 * 
 * @param {boolean} show - Displays unit management modal.
 * @param {function} handleClose - Function to close modal.
 * 
 * @returns {JSX.Element} - Modal for a property manager's unit management. 
 */
function PMUnits({ show, handleClose }) {
    const [units, setUnits] = useState([]);
    const [addingUnit, setAddingUnit] = useState(false);
    const [newUnit, setNewUnit] = useState({ name: '' });

    const property_id = 1;

    // Fetch all units for the property when modal opens.
    useEffect(() => {
        if (show) {
            fetch(`http://localhost:8080/api/property/unit/units?property_id=${property_id}`)
                .then(res => res.json())
                .then(data => setUnits(data))
                .catch(err => console.error('Error fetching units:', err));
        }
    }, [show]);

    const handleAddClick = () => {
        setAddingUnit(true);
        setNewUnit({ name: '' });
    };

    const handleSaveNewUnit = () => {
        if (!newUnit.name) return alert('Please enter a unit name');

        // Create unit.
        fetch('http://localhost:8080/api/property/unit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newUnit.name, property_id })
        })
            .then(res => res.json())
            .then(createdUnit => {
                // Fetch all units again to include the new one.
                return fetch(`http://localhost:8080/api/property/unit/units?property_id=${property_id}`)
                    .then(res => res.json())
                    .then(data => {
                        setUnits(data);
                        setAddingUnit(false);
                    });
            })
            .catch(err => console.error('Error creating/fetching unit:', err));
    };

    const handleRemoveUnit = (unitId) => {
        setUnits(prev => prev.filter(unit => unit.unit_id !== unitId));
        // TODO: call to the backend to remove unit.
    };

    return (
        <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} className="blur-background">
            
            <Modal.Header closeButton>
                <Modal.Title>Units</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {addingUnit ? (
                    <Form className="mb-3">
                        <Form.Group className="mb-2">
                            <Form.Label>Unit Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter unit name"
                                value={newUnit.name}
                                onChange={e => setNewUnit({ name: e.target.value })}
                            />
                        </Form.Group>

                        <Button variant="success" onClick={handleSaveNewUnit} className="me-2">Save</Button>
                        <Button variant="secondary" onClick={() => setAddingUnit(false)}>Cancel</Button>
                    </Form>
                ) : (
                    <div className="d-flex justify-content-end mb-3">
                        <Button variant="primary" onClick={handleAddClick}>+ Add Unit</Button>
                    </div>
                )}

                <Accordion>
                    {units.map((unit, idx) => (
                        <Accordion.Item eventKey={idx.toString()} key={unit.unit_id}>
                            <Accordion.Header>{unit.unit_name}</Accordion.Header>
                            <Accordion.Body>
                                <p><strong>Tenant Count:</strong> {unit.tenant_count}</p>
                                <Button variant="danger" size="sm" onClick={() => handleRemoveUnit(unit.unit_id)}>
                                    Remove Unit
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

export default PMUnits;
