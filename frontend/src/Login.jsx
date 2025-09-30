import { Image, Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import logo from "./assets/SS-logo-transparent.png"

import { useState } from 'react';


function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        console.log("Email entered: ", email);
        console.log("Password entered: ", password);
    };

    return (
        <>
            <Container fluid
                className="vh-100 d-flex justify-content-center pt-5 bg-dark">
                <Row className="w-100 justify-content-center">
                    <Col md={4}>

                        <Image
                            src={logo}
                            alt="Sapphire Sounds Logo"
                            fluid
                            className="mb-4"
                            rounded
                            style={{ objectFit: "cover", width: "100%" }}
                        />

                        <Card className="p-4 shadow-lg" style={{ backgroundColor: "#35363cff" }}>
                            <Card.Body>
                                <Form onSubmit={handleLogin}>
                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                                    </Form.Group>

                                    <Button variant="primary" type="submit" className="w-100">
                                        Login
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Login;