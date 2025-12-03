import {
  Container,
  Row,
  Col,
  Nav,
  Navbar,
  Button,
  Modal,
  Form,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import PMTenants from "./PMTenants";
import PMUnits from "./PMUnits";
import UnitRewardManager from "./UnitRewardManager";

function PropertyManager() {
  const navigate = useNavigate();

  const [managerData, setManagerData] = useState(null);
  const [propertyData, setPropertyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(1);
  const [hiddenPropertyIds, setHiddenPropertyIds] = useState([]);

  const [showTenants, setShowTenants] = useState(false);
  const [showUnits, setShowUnits] = useState(false);

  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [properties, setProperties] = useState([]);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyAddress, setNewPropertyAddress] = useState("");

  const fetchData = async (propertyId, options = {}) => {
    const { skipLoadingState = false } = options;
    try {
      if (!skipLoadingState) setLoading(true);

      const [managerRes, propertyRes] = await Promise.all([
        fetch(
          `http://localhost:8080/api/property/managers?property_id=${propertyId}`
        ),
        fetch(`http://localhost:8080/api/property?property_id=${propertyId}`),
      ]);

      if (!managerRes.ok || !propertyRes.ok)
        throw new Error("Failed to fetch data");

      const [managerDataJson, propertyDataJson] = await Promise.all([
        managerRes.json(),
        propertyRes.json(),
      ]);

      if (managerDataJson.length > 0) {
        setManagerData((prev) => prev ?? managerDataJson[0]);
      }
      if (propertyDataJson.length > 0) setPropertyData(propertyDataJson[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      if (!skipLoadingState) setLoading(false);
    }
  };

  // Load properties for the modal.
  const loadPropertiesForModal = async () => {
    try {
      // Load the simulated data for property IDs 1 and 2.
      const propertyIds = [1, 2];

      const responses = await Promise.all(
        propertyIds.map((id) =>
          fetch(`http://localhost:8080/api/property?property_id=${id}`)
        )
      );

      const dataArrays = await Promise.all(responses.map((res) => res.json()));

      const list = dataArrays
        .map((arr) => (Array.isArray(arr) && arr.length > 0 ? arr[0] : null))
        .filter((item) => item !== null);

      setProperties((prev) => {
        const merged = [...prev, ...list];

        const seen = new Set();
        return merged.filter((p) => {
          const id = p.property_id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
      });
    } catch (err) {
      console.error("Error loading properties for modal:", err);
    }
  };

  const handleOpenPropertyModal = () => {
    loadPropertiesForModal();
    setShowPropertyModal(true);
  };

  const handleClosePropertyModal = () => {
    setShowPropertyModal(false);
    setNewPropertyName("");
    setNewPropertyAddress("");
  };

  // Creates a new property using the backend endpoint (POST /api/property).
  const handleAddProperty = async () => {
    const trimmedName = newPropertyName.trim();
    const trimmedAddress = newPropertyAddress.trim();

    if (!trimmedName || !trimmedAddress) {
      alert("Please enter both a property name and an address.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/property/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          address001: trimmedAddress,
        }),
      });

      if (!response.ok) {
        console.error("Failed to create property. Status:", response.status);
        alert("There was a problem creating the property. Please try again.");
        return;
      }

      const result = await response.json();

      const createdProperty = {
        property_id: result.property_id,
        property_name: result.name,
        address001: result.address001,
      };

      setProperties((prev) => [...prev, createdProperty]);
      setNewPropertyName("");
      setNewPropertyAddress("");
    } catch (err) {
      console.error("Error creating property:", err);
      alert("There was a problem creating the property. Please try again.");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    // Cannot delete simulated property ids 1 and 2.
    if ([1, 2].includes(Number(propertyId))) {
      alert("This property cannot be deleted.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8080/api/property/remove",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ property_id: propertyId }),
        }
      );

      if (!response.ok) {
        console.error("Failed to delete property. Status:", response.status);
        const errBody = await response.json().catch(() => null);
        alert(
          errBody?.error ||
            "There was a problem deleting the property. Please try again."
        );
        return;
      }

      // If backend succeeded, remove from local list.
      setProperties((prev) => prev.filter((p) => p.property_id !== propertyId));
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("There was a problem deleting the property. Please try again.");
    }
  };

  // Fetch on initial page load.
  useEffect(() => {
    fetchData(activePropertyId);
  }, []);

  // Closing actions for modals.
  const handleCloseUnits = () => {
    setShowUnits(false);
  };

  const handleCloseTenants = () => {
    setShowTenants(false);
  };

  const handleSelectProperty = (property) => {
    const propertyId = Number(property.property_id);

    setActivePropertyId(propertyId); // Update which property is active.
    fetchData(propertyId);
    setPropertyData(property); // Use the property info on dashboard summary card.

    localStorage.setItem("activePropertyId", String(propertyId));

    setShowPropertyModal(false);
  };

  const refreshOverview = () => {
    // Re-fetch overview stats for the currently active property.
    if (!activePropertyId) return;
    fetchData(activePropertyId, { skipLoadingState: true });
  };

  if (loading)
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <h4 className="text-white">Loading...</h4>
      </Container>
    );

  if (error)
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <h4 className="text-danger">Error: {error}</h4>
      </Container>
    );

  return (
    <>
      <Container
        fluid
        className="vh-100 d-flex flex-column pt-5 gradient-background"
        style={{ overflowY: "auto" }}
      >
        <Row className="w-100 mb-2">
          <Col xs={12} md={8}>
            <h1 className="text-white mb-1">
              Welcome, {managerData?.manager_name}!
            </h1>
            {propertyData?.property_name && (
              <h5 className="text-white mb-3">{propertyData.property_name}</h5>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenPropertyModal}
            >
              View Properties
            </Button>
          </Col>
        </Row>

        <Row className="w-100 mb-4 justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <div
              className="p-4 liquid-glass text-white rounded"
              style={{
                minHeight: "250px",
                width: "100%",
                maxWidth: "100%",
                transition: "all 0.3s",
              }}
            >
              <ul className="list-unstyled mb-3" style={{ lineHeight: "2" }}>
                <li>
                  <strong>Address:</strong> {propertyData?.address001}{" "}
                  {propertyData?.address002
                    ? propertyData.address002 + " "
                    : ""}
                  {propertyData?.city}, {propertyData?.state}{" "}
                  {propertyData?.zipcode}
                </li>
                <li>
                  <strong>Units:</strong> {propertyData?.unit_count}
                </li>
                <li>
                  <strong>Tenants:</strong> {propertyData?.tenant_count}
                </li>
                <li>
                  <strong>Complaints:</strong> {propertyData?.complaint_count}
                </li>
                <li>
                  <strong>Rewards:</strong> {propertyData?.reward_count}
                </li>
              </ul>

              <UnitRewardManager propertyId={propertyData?.property_id} />
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showPropertyModal}
        onHide={handleClosePropertyModal}
        backdrop="static"
        keyboard={false}
        className="blur-background"
      >
        <Modal.Header closeButton>
          <Modal.Title>Properties</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h6 className="mb-3">Current Properties</h6>
          {properties.length === 0 ? (
            <p className="text-muted mb-3">No properties loaded.</p>
          ) : (
            <ul className="list-unstyled mb-3">
              {properties
                .filter(
                  (prop) =>
                    !hiddenPropertyIds.includes(Number(prop.property_id))
                )
                .map((prop) => (
                  <li
                    key={prop.property_id}
                    className="d-flex justify-content-between align-items-start mb-2"
                  >
                    <div>
                      <strong>
                        {prop.property_name}
                        {Number(prop.property_id) ===
                          Number(activePropertyId) && (
                          <span className="badge bg-primary ms-2">Active</span>
                        )}
                      </strong>
                      <div className="small text-muted">
                        {prop.address001 && <span>{prop.address001}</span>}
                        {prop.city && prop.state && (
                          <span>
                            {" "}
                            {prop.city}, {prop.state} {prop.zipcode ?? ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleSelectProperty(prop)}
                      >
                        Set Active
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteProperty(prop.property_id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
            </ul>
          )}

          <hr />

          <h6 className="mb-3">Add Property</h6>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Property Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter property name"
                value={newPropertyName}
                onChange={(e) => setNewPropertyName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address"
                value={newPropertyAddress}
                onChange={(e) => setNewPropertyAddress(e.target.value)}
              />
            </Form.Group>

            <Button variant="success" onClick={handleAddProperty}>
              Add Property
            </Button>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePropertyModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bottom Navigation */}
      <Navbar
        fixed="bottom"
        bg="dark"
        variant="dark"
        className="d-flex justify-content-around py-2"
      >
        <Nav.Item>
          <Nav.Link
            onClick={() => navigate("/welcome")}
            className="text-center text-white"
          >
            <div>
              <i className="bi bi-house-fill"></i>
            </div>
            <small>Home</small>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            onClick={() => setShowTenants(true)}
            className="text-center text-white"
          >
            <div>
              <i className="bi bi-person-lines-fill"></i>
            </div>
            <small>Tenants</small>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            onClick={() => setShowUnits(true)}
            className="text-center text-white"
          >
            <div>
              <i className="bi bi-house"></i>
            </div>
            <small>Units</small>
          </Nav.Link>
        </Nav.Item>

        <Nav.Item>
          <Nav.Link
            onClick={() => navigate("/property-manager")}
            className="text-center text-white"
          >
            <div>
              <i className="bi bi-gear-fill"></i>
            </div>
            <small>Settings</small>
          </Nav.Link>
        </Nav.Item>
      </Navbar>

      <PMTenants
        show={showTenants}
        handleClose={handleCloseTenants}
        propertyId={activePropertyId}
        onDataChanged={refreshOverview}
      />
      <PMUnits
        show={showUnits}
        handleClose={handleCloseUnits}
        propertyId={activePropertyId}
        onDataChanged={refreshOverview}
      />
      <UnitRewardManager
        propertyId={propertyData?.property_id ?? activePropertyId}
        onDataChanged={refreshOverview}
      />
    </>
  );
}

export default PropertyManager;
