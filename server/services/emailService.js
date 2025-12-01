/**
 * @module emailService
 * @description This service handles sending emails for various notifications using Nodemailer.
 * It uses an Ethereal test account for development.
 */

const nodemailer = require('nodemailer');

/** @type {import('nodemailer').Transporter} */
let transporter;

/**
 * Initializes the Nodemailer transporter using a test account from Ethereal.
 * This should be called once when the application starts.
 * @async
 * @returns {Promise<void>}
 */
async function initializeTransporter() {
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Ethereal test account created for development.');
  console.log('   User: %s', testAccount.user);
  console.log('   Pass: %s', testAccount.pass);
  console.log('   Preview URL: %s', nodemailer.getTestMessageUrl({})); 

  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

/**
 * Sends an email notification for a noise violation.
 * @async
 * @param {object} notificationPayload - The payload of the notification.
 * @param {string} notificationPayload.email - The recipient's email address.
 * @param {string} notificationPayload.message - The details of the noise violation.
 * @returns {Promise<void>}
 * @throws {Error} If the transporter is not initialized.
 */
async function sendNoiseViolationEmail(notificationPayload) {
  if (!transporter) {
    throw new Error('Email transporter is not initialized.');
  }

  const info = await transporter.sendMail({
    from: '"Sapphire Sounds" <noreply@sapphiresounds.com>',
    to: notificationPayload.email, 
    subject: 'Noise Violation Alert',
    text: `Hello, a noise violation has been recorded for your unit. Message: ${notificationPayload.message}`,
    html: `<p>Hello,</p><p>A noise violation has been recorded for your unit.</p><p><b>Details:</b> ${notificationPayload.message}</p>`,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

/**
 * Sends an email notification about a new complaint.
 * @async
 * @param {object} notificationPayload - The payload of the notification.
 * @param {string} notificationPayload.email - The recipient's email address.
 * @param {string} notificationPayload.message - The details of the complaint.
 * @returns {Promise<void>}
 * @throws {Error} If the transporter is not initialized.
 */
async function sendComplaintEmail(notificationPayload) {
  if (!transporter) {
    throw new Error('Email transporter is not initialized.');
  }

  const info = await transporter.sendMail({
    from: '"Sapphire Sounds" <noreply@sapphiresounds.com>',
    to: notificationPayload.email, 
    subject: 'New Complaint Filed',
    text: `Hello, a new complaint has been filed. Message: ${notificationPayload.message}`,
    html: `<p>Hello,</p><p>A new complaint has been filed.</p><p><b>Details:</b> ${notificationPayload.message}</p>`,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

/**
 * Sends an email notification for an earned reward.
 * @async
 * @param {object} notificationPayload - The payload of the notification.
 * @param {string} notificationPayload.email - The recipient's email address.
 * @param {string} notificationPayload.reward_name - The name of the reward.
 * @param {string} notificationPayload.reward_description - The description of the reward.
 * @returns {Promise<void>}
 * @throws {Error} If the transporter is not initialized.
 */
async function sendRewardEmail(notificationPayload) {
  if (!transporter) {
    throw new Error('Email transporter is not initialized.');
  }

  const info = await transporter.sendMail({
    from: '"Sapphire Sounds" <noreply@sapphiresounds.com>',
    to: notificationPayload.email, 
    subject: 'You Earned a Reward!',
    text: `Congratulations! You have earned a reward. \n Reward: ${notificationPayload.reward_name} \n Description: ${notificationPayload.reward_description}`,
    html: `<p>Congratulations!</p><p>You have earned a reward.</p><p><b>Reward:</b> ${notificationPayload.reward_name}</p><p><b>Description:</b> ${notificationPayload.reward_description}</p>`,
  });

  console.log('Message sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

module.exports = { initializeTransporter, sendNoiseViolationEmail, sendComplaintEmail, sendRewardEmail };
