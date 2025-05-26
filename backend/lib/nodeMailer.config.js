import nodemailer from 'nodemailer';

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,      // Replace with your Gmail address
    pass: process.env.NODEMAILER_PASS  // Replace with your App Password (no spaces)
  }
});

// Email options
const mailOptions = {
  from: process.env.NODEMAILER_EMAIL,         
  to: 'recipient@example.com',    
  subject: 'Test Email from Node.js',
  text: 'Hello! This is a test email sent from Node.js using Nodemailer.',
  html: `
    <h2>Hello from Node.js!</h2>
    <p>This is a <strong>test email</strong> sent using:</p>
    <ul>
      <li>Node.js</li>
      <li>Nodemailer</li>
      <li>Gmail SMTP</li>
    </ul>
    <p>Best regards,<br>Your Node.js App</p>
  `
};

// Send email
async function sendEmail() {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Call the function
sendEmail();

// Optional: Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log('Transporter verification failed:', error);
  } else {
    console.log('Server is ready to take our messages');
  }
});