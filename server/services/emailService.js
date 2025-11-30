const nodemailer = require('nodemailer');

let transporter;

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

module.exports = { initializeTransporter, sendNoiseViolationEmail, sendComplaintEmail };
