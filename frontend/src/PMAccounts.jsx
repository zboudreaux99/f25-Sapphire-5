import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function PMAccounts({ show, handleClose }) {
    return (
        <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} className='blur-background'>

            <Modal.Header closeButton>
                <Modal.Title>Accounts</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>Accounts body text goes here.</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PMAccounts;
