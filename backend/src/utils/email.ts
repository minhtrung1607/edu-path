import nodemailer from 'nodemailer';

export const sendOTP = async (email: string, otpCode: string) => {
  // Use Ethereal Email for testing if no real SMTP provided
  // Or just log it for local development
  console.log(`[EMAIL MOCK] Sending OTP to ${email}: ${otpCode}`);

  try {
    // let testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'ethereal_user', // Thay thế bằng ethereal user thật nếu cần check inbox
        pass: process.env.EMAIL_PASS || 'ethereal_pass',
      },
    });

    // We will bypass actual sending if ethereal user is fake
    if (process.env.EMAIL_USER) {
      const info = await transporter.sendMail({
        from: '"EduPath" <noreply@edupath.com>',
        to: email,
        subject: 'Mã xác thực OTP của bạn - EduPath',
        text: `Mã OTP của bạn là: ${otpCode}. Mã này có hiệu lực trong 5 phút.`,
        html: `<p>Mã OTP của bạn là: <b>${otpCode}</b>. Mã này có hiệu lực trong 5 phút.</p>`,
      });
      console.log('Message sent: %s', info.messageId);
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
