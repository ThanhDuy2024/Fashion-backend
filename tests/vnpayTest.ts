import { Request, Response } from "express";
import moment from "moment";
import crypto from "crypto";
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
export const paymentCreate = async (req: Request, res: Response) => {
  try {
    const tmnCode = "OBJ2ET2V";
    const secretKey = "HJZJTV8FXHC4RF5VOG7EA32TPW22GK51";
    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = "https://sandbox.vnpayment.vn/return-demo";

    const date = new Date();
    const createDate = moment(date).format("YYYYMMDDHHmmss");
    const orderId = `order-${Date.now()}`;
    const amount = 10000; // VND

    const ipAddr =
      (req.headers["x-forwarded-for"] as string) ||
      req.socket.remoteAddress ||
      "127.0.0.1";
    const cleanIp = ipAddr.includes("::1") ? "127.0.0.1" : ipAddr;

    const vnp_Params: Record<string, any> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan cho ma GD: ${orderId}`,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: cleanIp,
      vnp_CreateDate: createDate,
    };

    // Sắp xếp key
    const sortedKeys = Object.keys(vnp_Params).sort();
    const signData = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");

    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    // Append hash cuối cùng
    const query = sortedKeys
      .map((key) => `${key}=${encodeURIComponent(vnp_Params[key])}`)
      .join("&");
    const paymentUrl = `${vnpUrl}?${query}&vnp_SecureHash=${signed}`;

    console.log("✅ Final URL:", paymentUrl);
    res.json({ paymentUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Tạo thanh toán thất bại" });
  }
};

export const paymentZalopay = async (req: Request, res: Response) => {
  try {

    const config = {
      app_id: process.env.ZALOPAY_APP_ID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT
    };

    const embed_data = {
      redirecturl: `${process.env.ZALOPAY_REDIRECT_URL}/order/success?orderId=&phone=`
    };

    const items = [{
      itemname: "Thanh toán dịnh vụ tour du lịch"
    }];
    const transID = Math.floor(Math.random() * 1000000);
    const order:any = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: `ok-xong chuyen`,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: 100000, //So tien cua don hang
      description: `Thông tin đơn hàng #${req.query.orderId}`, //thong tin cua don hang
      bank_code: "", //Bo rong de thanh toan duoc nhieu phuong thuc hon
      callback_url: `${process.env.ZALOPAY_REDIRECT_URL}/order/result-zalopay`
    };

    // appid|app_trans_id|appuser|amount|apptime|embeddata|item
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post(config.endpoint, null, { params: order })
    if (response.data.return_code == 1) {
      res.json({
        url: response.data.order_url
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
}
