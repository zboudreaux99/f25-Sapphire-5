const { sendNoiseViolationEmail } = require('./emailService');

async function listenForNotifications(pool) {
  const client = await pool.connect();

  try {
    await client.query('LISTEN noise_violation');
    // await client.query('LISTEN new_complaint'); // Example for the future
    // await client.query('LISTEN new_reward');   // Example for the future

    console.log('✅ Successfully connected and listening for database notifications.');
    // Listen for notifications
    client.on('notification', (msg) => {
      console.log('--- 📢 New Notification Received ---');
      console.log(`Channel: ${msg.channel}`);

      try {
        const payload = JSON.parse(msg.payload);
        console.log('Payload:', payload);

        switch (msg.channel) {
          case 'noise_violation':
            (async () => {
              try {
                console.log(`Handling noise violation for user ${payload.user_id}`);
                
                // Send email notification
                await sendNoiseViolationEmail(payload);

              } catch (emailError) {
                console.error('Failed to send noise violation email:', emailError);
              }
            })();
            break;

          case 'new_complaint':
            // Future logic for handling new complaints
            break;

          case 'new_reward':
            // Future logic for handling new rewards
            break;

          default:
            console.warn(`Received notification on unhandled channel: ${msg.channel}`);
        }

      } catch (error) {
        console.error('Error parsing notification payload:', error);
      }
    });

    client.on('end', () => {
      console.log('Notification client disconnected.');
    });

  } catch (error) {
    console.error('Failed to set up notification listener:', error);
    client.release();
  }
}
module.exports = { listenForNotifications };
