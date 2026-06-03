
const nodemailer = require("nodemailer");

// Dán đoạn code Thắng vừa copy từ Mailtrap vào đây
const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "bc14e0a131b798",
    pass: "265364711aab87"
  }
});


// Sử dụng module.exports kiểu này để khớp với lệnh require có dấu { }
const sendResetPasswordEmail = async (toEmail, resetLink) => {
  try {
    const mailOptions = {
    from: '"BK SmartHome" <admin@bksmarthome.com>',
    to: toEmail,
    subject: "🔐 Đặt lại mật khẩu tài khoản BK SmartHome",
    html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #333333; text-align: center;">Thiết lập lại mật khẩu</h2>
            <p style="color: #555555; line-height: 1.6; font-size: 15px;">
                Chào bạn,<br><br>
                Hệ thống BK SmartHome đã nhận được yêu cầu thay đổi mật khẩu từ bạn. Vui lòng bấm vào nút bảo mật bên dưới để tiến hành thiết lập mật khẩu mới:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" target="_blank" style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(0,123,255,0.25);">
                    Xác nhận đặt lại mật khẩu
                </a>
            </div>

            <p style="color: #999999; font-size: 12px; line-height: 1.6; border-top: 1px solid #eeeeee; padding-top: 15px;">
                * Liên kết này chỉ có hiệu lực bảo mật trong vòng <b>15 phút</b>.<br>
                * Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để giữ an toàn cho tài khoản.
            </p>
        </div>
    `
};
    return await transport.sendMail(mailOptions);
  } catch (error) {
    console.log("Loi gui mail:", error);
  }
};

module.exports = { sendResetPasswordEmail };