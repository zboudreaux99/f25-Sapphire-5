import { Carousel, Container, Row, Card, Col, Nav, Navbar } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Rewards from "./Rewards";
import Report from "./Report";
import MonthlyChart from "./MonthlyChart";

/**
 * Tenant function
 *  Displays the tenant dashboard, including:
 *  - A welcome message with tenant email.
 *  - A carousel chart view displayable by week, day, or hour.
 *  - Bottom navigation bar (Home, Report, Rewards, Settings).
 *  - Modals for rewards and report submission.
 * 
 * @returns {JSX.Element} Tenant dashboard.
 */
function Tenant() {
    const navigate = useNavigate();

    // Get email from localStorage or fallback to placeholder
    const userEmail = localStorage.getItem('email') || 'Tenant';

    const [index, setIndex] = useState(0);
    const handleSelect = (selectedIndex) => setIndex(selectedIndex);

    const [showRewards, setShowRewards] = useState(false);
    const handleShowRewards = () => setShowRewards(true);
    const handleCloseRewards = () => setShowRewards(false);

    const [showReport, setShowReport] = useState(false);
    const handleShowReport = () => setShowReport(true);
    const handleCloseReport = () => setShowReport(false);

    const handleSubmitReport = (data) => {
        console.log("Report submitted:", data);
         // TODO: Send this to the backend although this is a prototype
    };

    const [chartView, setChartView] = useState("week");

    return (
        <>
            <Container
                fluid
                className="vh-100 d-flex flex-column justify-content-center pt-5 gradient-background"
            >
                <Row className="w-100 justify-content-center">
                    <h1 className="text-white mb-4">Welcome, {userEmail}!</h1>
                </Row>

                <Row className="w-100 justify-content-center mb-4">
                    <Col>
                        <h5 className="text-white">Tenant</h5>
                    </Col>
                    <Col></Col>
                    <Col>
                        <h5 className="text-white text-end text-middle">College Apartments</h5>
                    </Col>
                </Row>

                {/* Carousel of months */}
                <Row className="justify-content-center">
                    <Col>
                        <Carousel
                            activeIndex={index}
                            onSelect={handleSelect}
                            interval={null}
                            indicators={false}
                        >
                            <Carousel.Item>
                                <Card
                                    className="shadow-lg liquid-glass text-center mx-auto"
                                    style={{
                                        backgroundColor: "transparent",
                                        height: "300px",
                                        maxWidth: "600px",
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column justify-content-center">
                                        <MonthlyChart month="September" view={chartView} />
                                    </Card.Body>
                                </Card>
                            </Carousel.Item>

                            <Carousel.Item>
                                <Card
                                    className="shadow-lg liquid-glass text-center mx-auto"
                                    style={{
                                        backgroundColor: "transparent",
                                        height: "300px",
                                        maxWidth: "600px",
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column justify-content-center">
                                        <MonthlyChart month="October" view={chartView} />
                                    </Card.Body>
                                </Card>
                            </Carousel.Item>

                            <Carousel.Item>
                                <Card
                                    className="shadow-lg liquid-glass text-center mx-auto"
                                    style={{
                                        backgroundColor: "transparent",
                                        height: "400px",
                                        maxWidth: "500px",
                                    }}
                                >
                                    <Card.Body className="d-flex flex-column justify-content-center">
                                        <MonthlyChart month="November" view={chartView} />
                                    </Card.Body>
                                </Card>
                            </Carousel.Item>
                        </Carousel>
                    </Col>
                </Row>

                {/* Tabs for switching chart views */}
                <Row>
                    <Card style={{ backgroundColor: "transparent" }}>
                        <Card.Body className="d-flex flex-column justify-content-center">
                            <style>
                                {`
                .nav-link.active {
                  color: white !important;
                  background-color: #007bff !important;
                }
                `}
                            </style>
                            <Nav
                                variant="tabs"
                                activeKey={chartView}
                                onSelect={(selectedKey) => setChartView(selectedKey)}
                            >
                                <Nav.Item>
                                    <Nav.Link eventKey="week" style={{ color: "white" }}>
                                        Week
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="day" style={{ color: "white" }}>
                                        Day
                                    </Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link eventKey="hour" style={{ color: "white" }}>
                                        Hour
                                    </Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Card.Body>
                    </Card>
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
                        <div>
                            <i className="bi bi-house-fill"></i>
                        </div>
                        <small>Home</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={handleShowReport} className="text-center text-white">
                        <div>
                            <i className="bi bi-flag-fill"></i>
                        </div>
                        <small>Report</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={handleShowRewards} className="text-center text-white">
                        <div>
                            <i className="bi bi-gift"></i>
                        </div>
                        <small>Rewards</small>
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link onClick={() => navigate("/tenant")} className="text-center text-white">
                        <div>
                            <i className="bi bi-gear-fill"></i>
                        </div>
                        <small>Settings</small>
                    </Nav.Link>
                </Nav.Item>
            </Navbar>

            <Rewards show={showRewards} handleClose={handleCloseRewards} />
            <Report
                show={showReport}
                handleClose={handleCloseReport}
                handleSubmitReport={handleSubmitReport}
            />
        </>
    );
}

export default Tenant;
