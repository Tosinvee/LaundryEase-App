const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

const sendVerificationEmail = (email, token) => {
  const host = "localhost"; // Replace with your production domain in production
  const port = 5050; // Replace with your development port number
  const verificationUrl = `http://${host}:${port}/api/users/verifyEmail?token=${token}`;

  const mailOptions = {
    from: "your-email@gmail.com",
    to: email,
    subject: "Email Verification",
    html: `<p>Please verify your email by clicking on the following link:</p>
             <a href="${verificationUrl}">Verify Email</a>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification email sent: " + info.response);
    }
  });
};

module.exports = sendVerificationEmail;