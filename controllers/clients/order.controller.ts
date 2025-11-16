import { Response } from "express";
import { client } from "../../interface/client.interface";
import { Product } from "../../models/product.model";
import { Coupon } from "../../models/coupon.model";
import { Order } from "../../models/order.model";
import { paginationCLient } from "../../helpers/pagination.helper";
import moment from "moment";
import { paymentStatusVariable, statusVariable } from "../../configs/paymentVariable";
import { htmlCreatedOrder } from "../../helpers/htmlContext.helper";
import { sendEmail } from "../../helpers/nodemailer.helper";
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const skip = 0
const limit = 5
export const createOrder = async (req: client, res: Response) => {
  try {

    const finalData: any = {
      userId: req.client.id,
      email: req.client.email,
      address: req.client.address,
      phone: req.client.phone,
      orderList: [],
      coupon: "",
      discount: "",
      paymentMethod: req.body.paymentMethod
    };

    if (!finalData.address && !finalData.phone) {
      return res.status(400).json({
        code: "error",
        message: "you have not updated phone and address!"
      });
    }

    if (req.body.coupon) {
      const coupon = await Coupon.findOne({
        name: req.body.coupon,
        status: "active"
      });

      if (!coupon) {
        return res.status(404).json({
          code: "error",
          message: "The coupon is over"
        });
      }

      const order = await Order.findOne({
        userId: finalData.userId,
        coupon: coupon.name,
        deleted: false
      });

      if (order) {
        return res.status(400).json({
          code: "error",
          message: "Coupon has been used!"
        })
      }

      finalData.coupon = coupon.name;
      finalData.discount = String(coupon.discount) + "%"
    }

    for (const item of req.body.arrayOrder) {
      const product = await Product.findOne({
        _id: item.id,
        quantity: { $gte: item.quantity },
        status: "active",
        deleted: false,
        size: item.size
      });

      if (!product) {
        return res.status(404).json({
          code: "error",
          message: `Sản phẩm ${item.name} đã hết hàng, quý khách vui lòng xóa sản phẩm khỏi giỏ hàng trước khi thanh toán!`
        });
      }

      finalData.orderList.push({
        id: product.id,
        name: product.name,
        image: product.image || "",
        quantity: parseInt(item.quantity),
        size: item.size,
        price: product.currentPrice ? product.currentPrice : product.originPrice,
      });

      const p = await Product.updateOne({
        _id: product.id
      }, {
        quantity: Number(product.quantity) - item.quantity
      });
      console.log(p);
    }

    // Xử lý giảm giá
    let discountPercent = 0;
    if (finalData.discount) {
      discountPercent = parseFloat(finalData.discount.replace("%", ""));
    }

    const total = finalData.orderList.reduce((sum: any, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);


    let totalAfterDiscount = total - (total * discountPercent / 100);
    finalData.totalOrder = total;
    finalData.totalAfterDiscount = totalAfterDiscount;

    //create order here
    const result = await Order.create(finalData);

    const date = moment(result.createdAt).format("HH:mm DD/MM/YYYY");

    const html = htmlCreatedOrder(req.client.fullName, result.id, date, result.totalAfterDiscount.toLocaleString("vi-VN"));

    const subject = "Create order complete!";
    sendEmail(req.client.email, html, subject);

    res.json({
      code: "success",
      message: "Order has been created!",
      data: req.body.paymentMethod,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const getAllOrder = async (req: client, res: Response) => {
  try {
    const find: any = {
      userId: req.client.id,
      deleted: false,
    }

    const { page } = req.query;

    let pageNumber: number = 1;
    if (page) {
      pageNumber = parseInt(String(page));
    };
    const countDocument = await Order.countDocuments(find);
    const pagination = paginationCLient(countDocument, pageNumber, skip, limit);

    const orderList = await Order.find(find).sort({ createdAt: "desc" }).skip(pagination.skip).limit(pagination.limit);

    const finalData: any = [];

    for (const item of orderList) {
      const rawData: any = {
        id: item.id,
        orderList: item.orderList,
        totalAfterDiscount: item.totalAfterDiscount,
        paymentStatus: "",
        status: "",
        createdAt: "",
      }

      if (item.createdAt) {
        rawData.createdAt = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
      }

      if (item.paymentStatus) {
        const findItem = paymentStatusVariable.find(v => v.key === item.paymentStatus);
        rawData.paymentStatus = findItem;
      };

      if (item.status) {
        const findItem = statusVariable.find(v => v.key === item.status);
        rawData.status = findItem;
      };
      finalData.push(rawData);
    };

    res.json({
      code: "success",
      data: finalData,
      totalPage: pagination.totalPage
    });
  } catch (error) {
    console.error(error);
    res.status(404).json({
      code: "error",
      message: error
    });
  }
}

export const orderZaloPay = async (req: client, res: Response) => {
  try {
    const finalData: any = {
      userId: req.client.id,
      email: req.client.email,
      address: req.client.address,
      phone: req.client.phone,
      orderList: [],
      coupon: "",
      discount: "",
      paymentMethod: req.body.paymentMethod
    }

    for (const item of req.body.arrayOrder) {
      const checkItem = await Product.findOne({
        _id: item.id,
        status: "active",
        deleted: false,
        quantity: { $gte: item.quantity },
        size: item.size
      })

      if (!checkItem) {
        return res.status(404).json({
          code: "error",
          message: "Item is not found!"
        })
      };

      finalData.orderList.push({
        id: item.id,
        name: item.name,
        image: item.image,
        quantity: item.quantity,
        size: item.size,
        price: checkItem.currentPrice ? checkItem.currentPrice : checkItem.originPrice
      });

      await Product.updateOne({
        _id: checkItem.id,
      }, {
        quantity: Number(checkItem.quantity) - item.quantity
      })
    }

    if(req.body.coupon) {
      const checkCoupon = await Coupon.findOne({
        name: req.body.coupon,
        status: "active",
      });

      if(!checkCoupon) {
        return res.status(404).json({
          code: "error",
          message: "Coupon is not found!"
        });
      }

      const checkOrder = await Order.findOne({
        userId: req.client.id,
        coupon: checkCoupon.name,
        deleted: false
      })

      if(checkOrder) {
        return res.status(400).json({
          code: "error",
          message: "Coupon has been used!"
        });
      }
      finalData.coupon = checkCoupon.name;
      finalData.discount = String(checkCoupon.discount) + "%"
    }

    // Xử lý giảm giá
    let discountPercent = 0;
    if (finalData.discount) {
      discountPercent = parseFloat(finalData.discount.replace("%", ""));
    }

    const total = finalData.orderList.reduce((sum: any, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);


    let totalAfterDiscount = total - (total * discountPercent / 100);
    finalData.totalOrder = total;
    finalData.totalAfterDiscount = totalAfterDiscount;

    const orderSave = await Order.create(finalData);
    console.log(orderSave.id);

    const config = {
      app_id: process.env.ZALOPAY_APP_ID,
      key1: process.env.ZALOPAY_KEY1,
      key2: process.env.ZALOPAY_KEY2,
      endpoint: process.env.ZALOPAY_ENDPOINT
    };

    const embed_data = {
      redirecturl: `http://localhost:5173/`
    };

    const items = [{
      itemname: "Thanh toán dịnh vụ shop thời trang"
    }];
    const transID = Math.floor(Math.random() * 1000000);
    const order:any = {
      app_id: config.app_id,
      app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
      app_user: `Thông tin hóa đơn`,
      app_time: Date.now(), // miliseconds
      item: JSON.stringify(items),
      embed_data: JSON.stringify(embed_data),
      amount: finalData.totalAfterDiscount, //So tien cua don hang
      description: `Thông tin đơn hàng #${orderSave.id}`, //thong tin cua don hang
      bank_code: "", //Bo rong de thanh toan duoc nhieu phuong thuc hon
      callback_url: `http://localhost:5173/`
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

    //Khi thanh toan qua zaloPay
    //paymentStatus => paid
    //status => init

    res.json({
      code: "success",
      message: "Buy success",
      data: finalData
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const orderDetail = async (req: client, res: Response) => {
  try {
    const { id } = req.params;
    const item = await Order.findOne({
      _id: id,
      userId: req.client.id,
      deleted: false,
    });

    if (!item) {
      return res.status(404).json({
        code: "error",
        message: "Order is not found!"
      });
    };

    const finalData: any = {
      id: item.id,
      address: item.address,
      phone: item.phone,
      coupon: item.coupon,
      discount: item.discount,
      orderList: item.orderList,
      totelOrder: item.totalOrder,
      totalAfterDiscount: item.totalAfterDiscount,
      paymentStatus: item.paymentStatus,
      paymentMethod: item.paymentMethod,
      createdAt: "",
    };

    if (item.createdAt) {
      finalData.createdAt = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    };

    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const deleteOrder = async (req: client, res: Response) => {
  try {
    const { id } = req.params;

    const orderCheck = await Order.findOne({
      _id: id,
      userId: req.client.id,
      paymentStatus: "unpaid",
      deleted: false
    });

    if (!orderCheck) {
      return res.status(404).json({
        code: "error",
        message: "Đơn hàng của bạn không thể bị hủy do bạn đã thanh toán vui lòng liên hệ qua phần liên lạc!"
      });
    }

    for (const item of orderCheck.orderList) {
      const checkItem = await Product.findOne({
        _id: item.id,
        deleted: false
      });

      if(checkItem) {
        await Product.updateOne({
          _id: checkItem.id
        }, {
          quantity: Number(checkItem.quantity) + item.quantity
        })
      }
    }

    await Order.deleteOne({
      _id: id,
      userId: req.client.id,
      paymentStatus: "unpaid",
      deleted: false
    });

    res.json({
      code: "success",
      message: "The order has been deleted!"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}