import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import axios from "axios";

/**
 * Report function
 * Displays a report form where tenants can submit tenant name or apartment number and the issue description.
 *
 * @param {boolean} show - Displays Report a Tenant modal.
 * @param {function} handleClose - Function to close modal.
 * @param {function} handleSubmitReport - Function to receive reported data.
 *
 * @returns {JSX.Element} - Modal for fill-out form necessary to submit a report.
 */
function Report({ show, handleClose, handleSubmitReport }) {
  const [details, setDetails] = useState("");
  const [units, setUnits] = useState([]); // List of available units.
  const [selectedUnitId, setSelectedUnitId] = useState(""); // Selected unit ID.

  const userId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage.
  const propertyId = localStorage.getItem("propertyId") || 1; // Default to propertyId 1 if not set.

  // Fetch available units for the property when the modal is opened.
  useEffect(() => {
    axios
      .get(
        `http://localhost:8080/api/property/unit/units?property_id=${propertyId}`
      )
      .then((response) => {
        setUnits(response.data); // Set the list of available units.
      })
      .catch((error) => {
        console.error("Error fetching units:", error);
      });
  }, [propertyId]);

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data.
    if (!selectedUnitId || !details) {
      alert("Please fill out all fields.");
      return;
    }

    const complaintData = {
      initiating_tenant_id: userId,
      complained_about_unit_id: selectedUnitId, // Using the unit ID.
      description: details,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/api/property/complaints",
        complaintData
      );
      console.log("Complaint submitted successfully", response.data);

      if (handleSubmitReport) handleSubmitReport(response.data);

      // Clear form and close modal.
      setDetails("");
      setSelectedUnitId(""); // Reset selected unit ID.
      handleClose();
    } catch (error) {
      console.error("Error submitting complaint:", error);
      alert("There was an error submitting your complaint. Please try again.");
    }
  };

  // Returns the modal for the report interface.
  return (
    <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Report a Tenant</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Select Unit</Form.Label>
            <Form.Control
              as="select"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              required
            >
              <option value="">Select a unit</option>
              {units.length > 0 ? (
                units.map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.unit_name} {/* Assuming `unit_name` is the name */}
                  </option>
                ))
              ) : (
                <option value="">No units available</option>
              )}
            </Form.Control>
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
