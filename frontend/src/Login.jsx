import { Image, Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useState } from 'react';
import { useNavigate } from "react-router-dom";

/**
 * Creates the functional login box that allows users to enter their email and password.
 * 
 * @return The rows, columns, buttons, container, and cards needed to create the login box.
 */
function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(data.message || 'Login failed');
                return;
            }

            // Save token and role to local storage.
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('email', data.user.email);

            // Redirect based on role.
            if (data.user.role === 'tenant') {
                navigate('/tenant');
            } else if (data.user.role === 'manager') {
                navigate('/property-manager');
            } else {
                navigate('/welcome');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to reach the server');
            setLoading(false);
        }
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
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Control
                                            type="password"
                                            placeholder="Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    {error && (
                                        <div className="text-danger mb-3">{error}</div>
                                    )}

                                    <Row className="align-items-center mt-3">
                                        <Col></Col>

                                        <Col className="d-flex justify-content-center">
                                            <Button variant="outline-light" disabled={loading}>
                                                Forgot password?
                                            </Button>
                                        </Col>

                                        <Col className="d-flex justify-content-end">
                                            <Button
                                                type="submit"
                                                disabled={loading}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    color: '#000',
                                                }}
                                            >
                                                <span
                                                    className="bi bi-arrow-right-circle-fill text-white"
                                                    style={{ fontSize: '3rem' }}
                                                ></span>
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>

                                {loading && <div className="text-white mt-3">Logging in...</div>}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-3 justify-content-center">
                    <Button
                        variant="primary"
                        className="text-white"
                        onClick={() => navigate('/register')}
                    >
                        New tenants, create account here!
                    </Button>
                </Row>
            </Container>
        </>
    );
}

export default Login;
