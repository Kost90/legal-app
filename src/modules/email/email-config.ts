export default () => ({
  frontEndUrl: process.env.FRONTEND_URL,
  emailFrom: process.env.EMAIL_FROM_NAME,
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS,
  smtHost: process.env.BREVO_SMTP_HOST,
  smtPort: process.env.BREVO_SMTP_PORT,
  smtUser: process.env.BREVO_SMTP_USER,
  smtPass: process.env.BREVO_SMTP_PASS,
});
