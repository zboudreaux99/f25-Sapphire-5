import { Container, Row, Card, Button, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * Welcome function
 *  Displays the welcome screen for users.
 *  Allows user a role selection (Tenant, Landlord).
 *  Navigates to the login page based on the selected role.
 *
 * @returns {JSX.Element} Welcome screen interface.
 */
function Welcome() {
    const navigate = useNavigate();

    const handleTenantClick = () => {
        navigate('/login');
    }

    const handleLandlordClick = () => {
        navigate('/login');
    }

    return (
        <>
            <Container
                fluid
                className="vh-100 d-flex flex-column justify-content-center pt-5 gradient-background"
            >
                <Row className="w-100 justify-content-center">
                    <h1 className="text-white mb-4">Welcome!</h1>
                </Row>

                <Row className="w-100 justify-content-center mb-4">
                    <Col xs="auto" className="text-center">
                        <h5 className="text-white">Are you a</h5>
                    </Col>
                </Row>

                <div
                    className="d-flex justify-content-center gap-4 flex-nowrap px-3"
                    style={{ overflowX: 'auto' }}
                >

                    <Button
                        variant="link"
                        onClick={() => handleTenantClick()}
                        className="p-0 m-0 border-0 text-decoration-none"
                        style={{ flex: '0 0 auto', minWidth: '220px', maxWidth: '220px' }}
                    >
                        <Card className="p-3 text-center shadow-lg liquid-glass h-100">
                            {/* <Card.Img
                                variant="top"
                                src="https://via.placeholder.com/150"
                                style={{ objectFit: 'cover', height: '200px' }}
                            /> */}
                            <span class="bi bi-house" style={{ fontSize: '8rem' }}></span>
                            <Card.Body>
                                <Card.Title>Tenant</Card.Title>
                                <Card.Text></Card.Text>
                            </Card.Body>
                        </Card>
                    </Button>


                    <Button
                        variant="link"
                        onClick={() => handleLandlordClick()}
                        className="p-0 m-0 border-0 text-decoration-none"
                        style={{ flex: '0 0 auto', minWidth: '220px', maxWidth: '220px' }}
                    >
                        <Card className="p-3 text-center shadow-lg liquid-glass h-100">
                            {/* <Card.Img
                                variant="top"
                                src="https://via.placeholder.com/150"
                                style={{ objectFit: 'cover', height: '200px' }}
                            /> */}
                            <span class="bi bi-houses" style={{ fontSize: '8rem' }}></span>
                            <Card.Body>
                                <Card.Title>Landlord</Card.Title>
                                <Card.Text></Card.Text>
                            </Card.Body>
                        </Card>
                    </Button>
                </div>


                <Row className="justify-content-center mt-4">
                    <Button variant="primary" className="text-white">
                        Admin Login
                    </Button>
                </Row>
            </Container>
        </>
    );
}

export default Welcome;
