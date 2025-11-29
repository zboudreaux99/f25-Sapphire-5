import { Container, Row, Button, Col, Nav, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import PMTenants from "./PMTenants";
import PMUnits from "./PMUnits";

function PropertyManager() {
    const navigate = useNavigate();

    const [managerData, setManagerData] = useState(null);
    const [propertyData, setPropertyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showTenants, setShowTenants] = useState(false);
    const handleShowTenants = () => setShowTenants(true);
    const handleCloseTenants = () => setShowTenants(false);

    const [showUnits, setShowUnits] = useState(false);
    const handleShowUnits = () => setShowUnits(true);
    const handleCloseUnits = () => setShowUnits(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [managerRes, propertyRes] = await Promise.all([
                    fetch("http://localhost:8080/api/property/managers?property_id=1"),
                    fetch("http://localhost:8080/api/property?property_id=1")
                ]);

                if (!managerRes.ok || !propertyRes.ok)
                    throw new Error("Failed to fetch data");

                const [managerData, propertyData] = await Promise.all([
                    managerRes.json(),
                    propertyRes.json()
                ]);

                if (managerData.length > 0) setManagerData(managerData[0]);
                if (propertyData.length > 0) setPropertyData(propertyData[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <h4 className="text-white">Loading...</h4>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="d-flex justify-content-center align-items-center vh-100">
                <h4 className="text-danger">Error: {error}</h4>
            </Container>
        );
    }

    return (
        <>
            <Container
                fluid
                className="vh-100 d-flex flex-column justify-content-center pt-5 gradient-background"
            >
                <Row className="w-100 mb-2">
                    <Col>
                        <h1 className="text-white">Welcome, {managerData?.manager_name}!</h1>
                    </Col>
                </Row>

                <Row className="w-100 mb-4">
                    <Col>
                        <h4 className="text-white">{propertyData?.property_name}</h4>
                    </Col>
                </Row>

                <Row className="w-100 justify-content-center mb-4">
                    <Col xs={12} md={6}>
                        <div className="p-4 liquid-glass text-white rounded">
                            <ul className="list-unstyled mb-0" style={{ lineHeight: "2" }}>
                                <li><strong>Address:</strong> {propertyData?.address001} {propertyData?.address002 ? propertyData.address002 + " " : ""}{propertyData?.city}, {propertyData?.state} {propertyData?.zipcode}</li>
                                <li><strong>Units:</strong> {propertyData?.unit_count}</li>
                                <li><strong>Tenants:</strong> {propertyData?.tenant_count}</li>
                                <li><strong>Complaints:</strong> {propertyData?.complaint_count}</li>
                                <li><strong>Rewards:</strong> {propertyData?.reward_count}</li>
                            </ul>
                        </div>
                    </Col>
                </Row>
            </Container>

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
                    <Nav.Link onClick={handleShowTenants} className="text-center text-white">
                        <div><i className="bi bi-person-lines-fill"></i></div>
                        <small>Tenants</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={handleShowUnits} className="text-center text-white">
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