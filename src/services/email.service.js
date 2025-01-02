const nodemailer = require('nodemailer');
const aws = require('@aws-sdk/client-ses');
const config = require('../config/config');
const logger = require('../config/logger');

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_SES_USERNAME,
    secretAccessKey: process.env.AWS_SES_SMTP_PASSWORD,
  },
});

const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});
/* istanbul ignore next */
if (config.env !== 'test') {
  transporter
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transporter.sendMail(msg);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, otp) => {
  const subject = 'Verify your email';
  const text = `
Dear User,
Thank you for registering with us.
Your OTP is ${otp}.

Thanks,
Team Alinda
  `;
  await sendEmail(to, subject, text);
};

module.exports = {
  transporter,
  sendEmail,
  sendVerificationEmail,
};
