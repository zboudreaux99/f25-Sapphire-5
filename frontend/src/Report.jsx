import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function Report({ show, handleClose, handleSubmitReport }) {
    const [reportedTenant, setReportedTenant] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const reportData = {
            reportedTenant,
            details,
            date: new Date().toISOString(),
        };

        if (handleSubmitReport) handleSubmitReport(reportData);

        // Clear form and close modal
        setReportedTenant('');
        setDetails('');
        handleClose();
    };

    return (
        <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Report a Tenant</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Tenant Name or Apartment Number</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter tenant name or unit"
                            value={reportedTenant}
                            onChange={(e) => setReportedTenant(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Describe the Issue</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            placeholder="Provide details about the issue..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit">
                        Submit Report
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}

export default Report;
