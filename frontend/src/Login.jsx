import { Image, Container, Row, Col, Card, Form, Button, Stack } from "react-bootstrap";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        //console.log("Email entered: ", email);
        //console.log("Password entered: ", password);
        navigate('/tenant');
    };

    const handleBackClicked = () => {
        navigate('/welcome');
    };

    return (
        <>
            <Container fluid className="vh-100 d-flex flex-column justify-content-center pt-5 gradient-background">
                <Row className="w-100 mb-4">
                    <Col className="d-flex justify-content-start">
                        <Button
                            onClick={handleBackClicked}
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#000',
                                padding: 0,
                            }}
                        >
                            <span
                                className="bi bi-arrow-left-circle text-white"
                                style={{ fontSize: '2rem' }}
                            ></span>
                        </Button>
                    </Col>
                </Row>

                <Row className="w-100 justify-content-center">
                    <h1 className="text-white mb-4">Welcome back!</h1>
                    <Col sm={8} md={8} lg={8} className="text-center">

                        <Card className="p-4 shadow-lg liquid-glass">
                            <Card.Body>
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </Form.Group>

                                    <Row className="align-items-center mt-3">
                                        <Col></Col>

                                        <Col className="d-flex justify-content-center">
                                            <Button variant="outline-light">Forgot password?</Button>
                                        </Col>

                                        <Col className="d-flex justify-content-end">
                                            <Button type="submit" style={{
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: '#000',
                                            }}>
                                                <span className="bi bi-arrow-right-circle-fill text-white" style={{ fontSize: '3rem' }}></span>

                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-3 justify-content-center">
                    <Button variant="primary" className="text-white">
                        New tenants, create account here!
                    </Button>
                </Row>

            </Container>
        </>
    );
}

export default Login;
