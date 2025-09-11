export const htmlCheckEmail = (otp: string) => {
  const htmlContent = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f9fafb; padding:20px;">
    <div style="max-width:480px; margin:0 auto; background:#ffffff; border-radius:10px; padding:24px; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      <h2 style="margin:0 0 16px; font-size:20px; color:#111827; text-align:center;">
        Xác nhận địa chỉ email của bạn
      </h2>
      <p style="font-size:14px; color:#374151; margin:0 0 20px; text-align:center;">
        Cảm ơn bạn đã đăng ký. Vui lòng sử dụng mã OTP bên dưới để xác nhận email.
      </p>
      <div style="text-align:center; margin:20px 0;">
        <span style="display:inline-block; font-size:24px; letter-spacing:6px; font-weight:bold; color:#2563eb; background:#f3f4f6; padding:12px 20px; border-radius:8px;">
          ${otp}
        </span>
      </div>
      <p style="font-size:13px; color:#6b7280; margin:0; text-align:center;">
        Mã OTP có hiệu lực trong 5 phút. Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
      </p>
    </div>
  </div>
`;
  return htmlContent;
}