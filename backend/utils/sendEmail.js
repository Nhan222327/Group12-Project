// Utility để gửi email (đơn giản hóa - trong production nên dùng service như SendGrid, AWS SES)
// Trong development, sẽ log token ra console

const sendEmail = async (options) => {
  // Trong production, sử dụng nodemailer hoặc email service
  // Ở đây chỉ log ra console để dễ test
  console.log('\n📧 ===== EMAIL SENT =====');
  console.log('To:', options.email);
  console.log('Subject:', options.subject);
  console.log('Message:', options.message);
  console.log('========================\n');
  
  // Nếu muốn gửi email thật, uncomment code bên dưới và cấu hình SMTP
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || options.message,
  };

  await transporter.sendMail(message);
  */
  
  return true;
};

module.exports = sendEmail;

