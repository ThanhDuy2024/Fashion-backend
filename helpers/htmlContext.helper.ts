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
};

export const htmlCreatedOrder = (name: string, orderId: string, orderDate: string, total: string) => {
  const htmlContent = `<body style="font-family: Arial, sans-serif; color: #333;">
    <div style="padding: 16px; border: 1px solid #eee; border-radius: 6px; max-width: 600px; margin: auto;">
      <div style="margin-bottom: 16px;">
        <h2 style="color: #2563eb; margin: 0;">Đặt hàng thành công!</h2>
        <p style="margin: 8px 0 0;">Xin chào <strong>${name}</strong>,</p>
        <p style="margin: 4px 0 0;">Cảm ơn bạn đã mua hàng tại <strong>Fahsion shop</strong>.</p>
      </div>

      <div style="margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 4px;">
        <div><strong>Mã đơn hàng:</strong>${orderId}</div>
        <div><strong>Ngày đặt:</strong>${orderDate}</div>
        <div><strong>Tổng tiền:</strong>${total}}</div>
      </div>

      <div style="margin-bottom: 16px;">
        <a href="{{orderUrl}}" 
           style="display:inline-block; padding: 10px 16px; background:#2563eb; color:#fff cursor-pointer; text-decoration:none; border-radius:4px;">
          Xem đơn hàng
        </a>
      </div>
    </div>
  </body>`;
  return htmlContent;
}