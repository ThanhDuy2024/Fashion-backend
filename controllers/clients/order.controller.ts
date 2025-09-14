import { Response } from "express";
import { client } from "../../interface/client.interface";
import { Product } from "../../models/product.model";
import { Coupon } from "../../models/coupon.model";
import { Order } from "../../models/order.model";

export const createOrder = async (req: client, res: Response) => {
  try {

    const finalData: any = {
      userId: req.client.id,
      address: req.client.address,
      phone: req.client.phone,
      orderList: [],
      coupon: "",
      discount: "",
      paymentMethod: req.body.paymentMethod
    };

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

      if(order) {
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
          message: `The product name ${item.name} is sold out or not enough quantity!`
        });
      }

      finalData.orderList.push({
        id: product.id,
        name: product.name,
        quantity: parseInt(item.quantity),
        size: item.size,
        price: product.currentPrice ? product.currentPrice : product.originPrice,
      });

      await Product.updateOne({
        _id: product.id
      }, {
        quantity: Number(product.quantity) - item.quantity
      });
    }

    // Xử lý giảm giá
    let discountPercent = 0;
    if (finalData.discount) {
      discountPercent = parseFloat(finalData.discount.replace("%", ""));
    }

    const total = finalData.orderList.reduce((sum:any, item:any) => {
      return sum + item.price * item.quantity;
    }, 0);

    
    let totalAfterDiscount = total - (total * discountPercent / 100);
    finalData.totalOrder = total;
    finalData.totalAfterDiscount = totalAfterDiscount;

    await Order.create(finalData);

    res.json({
      code: "success",
      message: "Order has been created!"
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}