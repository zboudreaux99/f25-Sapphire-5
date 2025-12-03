import { useState } from "react";
import { Container, Button} from "react-bootstrap";

/**
 * PROTOTYPE: Button created to simulate a loud noise.
 * When the noise level reaches '4', an email is sent out to notify a noise volation alert.
 * 
 * @return {Button} location and placement of "button".
 */
function LoudNoise(){
    /**
     * Backend call
        onClick={sendNoiseViolationEmail};
        const noiseTrigger = () => {
            try {
                const response = await axios.post('http://localhost:8080/api/emailService/noiseViolation', true);
                console.log('Noise level violation notification successful', true);

                if (sendNoiseViolationEmail) sendNoiseViolationEmail(true);
            
            } catch (err) {
                console.error('Error:', err);
                setError('Unable to simulate noise violation trigger.');
        }
    */

    const [showPopup, setShowPopup] = useState(false);

    const sendNoiseViolationEmail = () => {
        setShowPopup(true);  
    };

    // Returns container for noise button.
    return (
        <>
            <Container fluid className="vh-100 d-flex flex-column justify-content-center pt-5 gradient-background">
                <h5>When a tenant's noise level has reached a 4, a noise violation email will be sent.</h5>    
                <Button variant="primary" className="text-white mt-4" onClick={sendNoiseViolationEmail}>
                    Simulate Noise Level Trigger!
                </Button>

                {showPopup && (
                    <div style={{ position:"fixed", backgroundColor: "gray", borderRadius: "8px", padding: "15px" }}>
                        <p>Noise violation email has been sent.</p>
                        <Button onClick={() => setShowPopup(false)} className="mt-1">
                                Close
                        </Button>
                    </div>
                )}
            </Container>
        </>
    );
}

export default LoudNoise;
