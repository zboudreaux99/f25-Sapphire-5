import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import ListGroup from 'react-bootstrap/ListGroup';

function Rewards({ show, handleClose }) {

    const rewards = [
        {
            id: 1,
            title: 'Rent Credit',
            icon: 'bi bi-cash-stack',
            description: 'Get a $50 credit toward next month’s rent.',
        },
        {
            id: 2,
            title: 'Free Covered Parking',
            icon: 'bi bi-car-front-fill',
            description: 'Enjoy one month of covered parking, on us.',
        },
        {
            id: 3,
            title: 'Laundry Tokens',
            icon: 'bi bi-basket-fill',
            description: 'Receive 10 free laundry tokens for your building’s machines.',
        },
        {
            id: 4,
            title: 'Local Café Gift Card',
            icon: 'bi bi-cup-hot-fill',
            description: 'Grab a $25 gift card to a neighborhood café.',
        },
    ];

    const handleSelectReward = (reward) => {
        console.log(`Selected reward: ${reward.title}`);
        
        // TODO: Handle reward redemption could be here although this is a prototype

        handleClose();
    };

    return (
        <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} className='blur-background'>
            <Modal.Header closeButton>
                <Modal.Title>Tenant Rewards</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <ListGroup>
                    {rewards.map((reward) => (
                        <ListGroup.Item
                            key={reward.id}
                            action
                            onClick={() => handleSelectReward(reward)}
                            className="d-flex align-items-center justify-content-between p-3 reward-item"
                        >
                            <div>
                                <h6 className="mb-1">
                                    <i className={`${reward.icon} me-2 text-primary`} style={{ fontSize: '1.5rem' }}></i>
                                    {reward.title}
                                </h6>
                                <small className="text-muted">{reward.description}</small>
                            </div>
                            <span
                                className="bi bi-arrow-right-circle-fill text-primary"
                                style={{ fontSize: '2rem' }}
                            ></span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default Rewards;
