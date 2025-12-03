import Button from 'react-bootstrap/Button';

/**
 * Button created to simulate a loud noise, which will cause a 
 * spike in the noise sensor graph in the application.
 *
 * @return {Button} location and placement of "button".
 */
function LoudNoise(){
    return (
        <>
            <Button type="button" className='mb-2 mt-2'> Button for LoudNoise test! </Button>
        </>
    )
}

export default LoudNoise