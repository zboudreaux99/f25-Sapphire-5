/**
 * @module notification-listener
 * @description This module sets up a listener for PostgreSQL notifications on specific channels.
 * When a notification is received, it dispatches the payload to the appropriate email service function.
 * This allows for a decoupled way to handle events happening in the database.
 */

const { sendNoiseViolationEmail, sendComplaintEmail, sendRewardEmail } = require('./emailService');

/**
 * Connects to the PostgreSQL database and listens for notifications on the 'noise_violation', 'complaint', and 'reward' channels.
 * @async
 * @param {import('pg').Pool} pool - The PostgreSQL connection pool.
 * @returns {Promise<void>} A promise that resolves when the listener is set up. The underlying client will continue to listen for notifications.
 */
async function listenForNotifications(pool) {
  const client = await pool.connect();

  try {
    await client.query('LISTEN noise_violation');
    await client.query('LISTEN complaint'); 
    await client.query('LISTEN reward');

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

          case 'complaint':
            (async () => {
              try {
                console.log(`Handling complaint for user ${payload.user_id}`);
                
                // Send email notification
                await sendComplaintEmail(payload);

              } catch (emailError) {
                console.error('Failed to send complaint email:', emailError);
              }
            })();
            break;

          case 'reward':
            (async () => {
              try {
                console.log(`Handling reward for user ${payload.user_id}`);
                
                // Send email notification
                await sendRewardEmail(payload);

              } catch (emailError) {
                console.error('Failed to send reward email:', emailError);
              }
            })();
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
