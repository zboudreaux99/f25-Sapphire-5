import { Container, Row, Col, Card, Form, Button } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const role = "tenant"; 

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
            });

            const data = await response.json();
            setLoading(false);

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                return;
            }

            
            setSuccess(true);

            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            console.error('Register error:', err);
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
                            style={{ backgroundColor: 'transparent', border: 'none', color: '#000', padding: 0 }}
                        >
                            <span className="bi bi-arrow-left-circle text-white" style={{ fontSize: "2rem" }}></span>
                        </Button>
                    </Col>
                </Row>

                <Row className="w-100 justify-content-center">
                    <h1 className="text-white mb-4">Create your account</h1>

                    <Col sm={8} md={8} lg={8} className="text-center">
                        <Card className="p-4 shadow-lg liquid-glass">
                            <Card.Body>
                                <Form onSubmit={handleRegister}>

                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="password"
                                            placeholder="Create password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Control
                                            type="password"
                                            placeholder="Confirm password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </Form.Group>

                                    {/* Error message */}
                                    {error && <div className="text-danger mb-3">{error}</div>}

                                    {/* Success message */}
                                    {success && (
                                        <div className="text-success fw-bold mb-3">
                                            Account created successfully! Redirecting to login...
                                        </div>
                                    )}

                                    <Row className="align-items-center mt-3">
                                        <Col></Col>
                                        <Col className="d-flex justify-content-end">
                                            <Button
                                                type="submit"
                                                disabled={loading || success}
                                                style={{ backgroundColor: 'transparent', border: 'none', color: '#000' }}
                                            >
                                                <span
                                                    className="bi bi-arrow-right-circle-fill text-white"
                                                    style={{ fontSize: '3rem' }}
                                                ></span>
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>

                                {loading && <div className="text-white mt-3">Creating account...</div>}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="mt-3 justify-content-center">
                    <Button variant="primary" className="text-white" onClick={() => navigate('/login')}>
                        Already have an account? Log in!
                    </Button>
                </Row>
            </Container>
        </>
    );
}

export default Register;
