import { Container, Row, Card, Button, Col, Nav, Navbar, Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

import PMTenants from "./PMTenants";
import PMAccounts from "./PMAccounts";

function PropertyManager() {
    const navigate = useNavigate();

    const handleAddClicked = () => {

    }


    const [showTenants, setShowTenants] = useState(false);
    const handleShowTenants = () => setShowTenants(true);
    const handleCloseTenants = () => setShowTenants(false);

    const [showAccounts, setShowAccounts] = useState(false);
    const handleShowAccounts = () => setShowAccounts(true);
    const handleCloseAccounts = () => setShowAccounts(false);


    return (
        <>
            <Container
                fluid
                className="vh-100 d-flex flex-column justify-content-center pt-5 gradient-background"
            >
                <Row className="w-100 justify-content-center mb-4">
                    <h1 className="text-white">Welcome, Archie!</h1>
                </Row>
                <Row className="w-100 justify-content-center mb-4">
                    <Col><h5 className="text-white">Property Manager</h5></Col>
                    <Col></Col>
                    <Col className="text-end">
                        <Button
                            onClick={() => handleAddClicked()}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#000',
                            }}
                        >
                            <span className="bi bi-plus-circle-fill text-white" style={{ fontSize: '2rem' }}></span>
                        </Button>
                    </Col>
                </Row>


                <Row className="w-100 liquid-glass">
                    <Accordion>
                        <Accordion.Item eventKey="0" className="mb-4">
                            <Accordion.Header >Little Root Homes</Accordion.Header>
                            <Accordion.Body>
                                <p>123 Street Avenue, Hoenn</p>
                                <p>14 Registered Tenants</p>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1" className="mb-4">
                            <Accordion.Header>Petalburg Apartments</Accordion.Header>
                            <Accordion.Body>
                                <p>123 Street Avenue, Hoenn</p>
                                <p>14 Registered Tenants</p>
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="2" className="mb-4">
                            <Accordion.Header>Oldale Town</Accordion.Header>
                            <Accordion.Body>
                                <p>123 Street Avenue, Hoenn</p>
                                <p>14 Registered Tenants</p>
                            </Accordion.Body>
                        </Accordion.Item>

                    </Accordion>
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
                        <div><i className="bi bi-house"></i></div>
                        <small>Tenants</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={handleShowAccounts} className="text-center text-white">
                        <div><i className="bi bi-person-lines-fill"></i></div>
                        <small>Accounts</small>
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
            <PMAccounts show={showAccounts} handleClose={handleCloseAccounts} />
        </>
    );
};

export default PropertyManager;