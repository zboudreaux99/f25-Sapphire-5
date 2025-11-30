import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

function Rewards({ show, handleClose }) {

    const [rewards, setRewards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (!show) return;

        const fetchRewards = async () => {
            try {
                setLoading(true);
                const res = await fetch("http://localhost:8080/api/property/rewards?property_id=1");
                if (!res.ok) throw new Error("Failed to load rewards");

                const data = await res.json();
                setRewards(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRewards();
    }, [show]);

    const handleSelectReward = (reward) => {
        // Remove reward immediately
        setRewards((prev) =>
            prev.filter((r) => r.reward_id !== reward.reward_id)
        );

        // Show toast
        setToastMessage(`${reward.reward_name} redeemed!`);
        setShowToast(true);

        // No modal closing
    };

    return (
        <>
            <Modal
                show={show}
                backdrop="static"
                keyboard={false}
                onHide={handleClose}
                className="blur-background"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Tenant Rewards</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {loading && <p>Loading rewards...</p>}
                    {error && <p className="text-danger">{error}</p>}

                    {!loading && !error && (
                        <ListGroup>
                            {rewards.map((reward) => (
                                <ListGroup.Item
                                    key={reward.reward_id}
                                    action
                                    onClick={() => handleSelectReward(reward)}
                                    className="d-flex align-items-center justify-content-between p-3 reward-item"
                                >
                                    <div>
                                        <h6 className="mb-1">
                                            <i className="bi bi-gift-fill me-2 text-primary"
                                               style={{ fontSize: '1.5rem' }}
                                            ></i>
                                            {reward.reward_name}
                                        </h6>
                                        <small className="text-muted">
                                            {reward.reward_description}
                                        </small>
                                    </div>

                                    <span
                                        className="bi bi-arrow-right-circle-fill text-primary"
                                        style={{ fontSize: '2rem' }}
                                    ></span>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}

                    {!loading && rewards.length === 0 && (
                        <p className="text-muted text-center mt-3">
                            🎉 All rewards redeemed!
                        </p>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Toast */}
            <ToastContainer position="bottom-center" className="mb-4">
                <Toast
                    onClose={() => setShowToast(false)}
                    show={showToast}
                    delay={2000}
                    autohide
                    bg="success"
                >
                    <Toast.Body className="text-white fw-bold">
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default Rewards;