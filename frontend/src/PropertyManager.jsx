import { Container, Row, Col, Nav, Navbar } from "react-bootstrap";
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

    const [showTenants, setShowTenants] = useState(false);
    const [showUnits, setShowUnits] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);

            const [managerRes, propertyRes] = await Promise.all([
                fetch("http://localhost:8080/api/property/managers?property_id=1"),
                fetch("http://localhost:8080/api/property?property_id=1")
            ]);

            if (!managerRes.ok || !propertyRes.ok) throw new Error("Failed to fetch data");

            const [managerDataJson, propertyDataJson] = await Promise.all([
                managerRes.json(),
                propertyRes.json()
            ]);

            if (managerDataJson.length > 0) setManagerData(managerDataJson[0]);
            if (propertyDataJson.length > 0) setPropertyData(propertyDataJson[0]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch on page load
    useEffect(() => {
        fetchData();
    }, []);

    // Closing actions for modals
    const handleCloseUnits = () => {
        setShowUnits(false);
        fetchData();   // Refresh data when Units modal closes
    };

    const handleCloseTenants = () => {
        setShowTenants(false);
        fetchData();   // Refresh data when Tenants modal closes
    };

    if (loading) return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <h4 className="text-white">Loading...</h4>
        </Container>
    );

    if (error) return (
        <Container className="d-flex justify-content-center align-items-center vh-100">
            <h4 className="text-danger">Error: {error}</h4>
        </Container>
    );

    return (
        <>
            <Container
                fluid
                className="vh-100 d-flex flex-column pt-5 gradient-background"
                style={{ overflowY: 'auto' }}
            >
                <Row className="w-100 mb-2">
                    <Col>
                        <h1 className="text-white">
                            Welcome, {managerData?.manager_name}!
                        </h1>
                    </Col>
                </Row>

                <Row className="w-100 mb-4 justify-content-center">
                    <Col xs={12} sm={10} md={8} lg={6} xl={5}>
                        <div
                            className="p-4 liquid-glass text-white rounded"
                            style={{
                                minHeight: '250px',
                                width: '100%',
                                maxWidth: '100%',
                                transition: 'all 0.3s'
                            }}
                        >
                            <ul className="list-unstyled mb-3" style={{ lineHeight: "2" }}>
                                <li>
                                    <strong>Address:</strong>{" "}
                                    {propertyData?.address001}{" "}
                                    {propertyData?.address002 ? propertyData.address002 + " " : ""}
                                    {propertyData?.city}, {propertyData?.state}{" "}
                                    {propertyData?.zipcode}
                                </li>
                                <li><strong>Units:</strong> {propertyData?.unit_count}</li>
                                <li><strong>Tenants:</strong> {propertyData?.tenant_count}</li>
                                <li><strong>Complaints:</strong> {propertyData?.complaint_count}</li>
                                <li><strong>Rewards:</strong> {propertyData?.reward_count}</li>
                            </ul>

                            <UnitRewardManager propertyId={propertyData?.property_id} />
                        </div>
                    </Col>
                </Row>

            </Container>

            {/* Bottom Navigation */}
            <Navbar
                fixed="bottom"
                bg="dark"
                variant="dark"
                className="d-flex justify-content-around py-2"
            >
                <Nav.Item>
                    <Nav.Link onClick={() => navigate("/welcome")} className="text-center text-white">
                        <div><i className="bi bi-house-fill"></i></div>
                        <small>Home</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={() => setShowTenants(true)} className="text-center text-white">
                        <div><i className="bi bi-person-lines-fill"></i></div>
                        <small>Tenants</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={() => setShowUnits(true)} className="text-center text-white">
                        <div><i className="bi bi-house"></i></div>
                        <small>Units</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={() => navigate("/property-manager")} className="text-center text-white">
                        <div><i className="bi bi-gear-fill"></i></div>
                        <small>Settings</small>
                    </Nav.Link>
                </Nav.Item>
            </Navbar>

            <PMTenants show={showTenants} handleClose={handleCloseTenants} />
            <PMUnits show={showUnits} handleClose={handleCloseUnits} />
        </>
    );
};

export default PropertyManager;