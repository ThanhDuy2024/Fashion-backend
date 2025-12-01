import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Order } from "../../models/order.model";
import moment, { months } from "moment";
import { AccountClient } from "../../models/accountClient.model";
import { Product } from "../../models/product.model";
const currentYear = new Date().getFullYear();
export const dashboardOrder = async (req: admin, res: Response) => {
  try {
    if (req.body.method == "") {
      //Lay ra tong don hang co trong thang
      const order = await Order.find({
        createdAt: {
          $gte: new Date(`${currentYear}-01-01`),
          $lte: new Date(`${currentYear}-12-31`)
        }
      }).select({
        id: 1,
        userId: 1,
        createdAt: 1
      });

      const orderMonth: any = [
        {
          month: "01",
          totalOrder: 0
        },
        {
          month: "02",
          totalOrder: 0
        },
        {
          month: "03",
          totalOrder: 0
        },
        {
          month: "04",
          totalOrder: 0
        },
        {
          month: "05",
          totalOrder: 0
        },
        {
          month: "06",
          totalOrder: 0
        },
        {
          month: "07",
          totalOrder: 0
        },
        {
          month: "08",
          totalOrder: 0
        },
        {
          month: "09",
          totalOrder: 0
        },
        {
          month: "10",
          totalOrder: 0
        },
        {
          month: "11",
          totalOrder: 0
        },
        {
          month: "12",
          totalOrder: 0
        }
      ]

      for (const om of orderMonth) {
        for (const item of order) {
          const my = moment(item.createdAt).format("YYYY-MM");
          if (my === `${currentYear}-${om.month}`) {
            om.totalOrder += 1
          }
        }
      }

      res.json({
        code: "success",
        data: orderMonth
      });
      //end //Lay ra tong don hang co trong thang
    } else {
      //Lay ra tong don hang theo nam
      const order = await Order.find({
      }).select({
        createdAt: 1
      }).sort({
        createdAt: "asc"
      });

      let tmpYear: Array<Number> = [];
      for (const item of order) {
        const getFullYear = moment(item.createdAt).format("YYYY");
        tmpYear.push(Number(getFullYear));
      }

      const setYear = new Set(tmpYear);

      const year = Array.from(setYear);

      const totalOrderByYear = [];

      for (let y of year) {
        const start = new Date(`${y}-01-01T00:00:00.000Z`);
        const end = new Date(`${y}-12-31T23:59:59.999Z`);
        const countByYear = await Order.countDocuments({
          createdAt: { $gte: start, $lte: end }
        });
        totalOrderByYear.push(countByYear);
      }

      return res.json({
        yearList: year,
        totalOrderByYear: totalOrderByYear
      })
    }

  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const totalPrice = async (req: admin, res: Response) => {
  try {
    const orderSuccess = await Order.find({
      deleted: false,
      paymentStatus: "paid"
    }).select({
      id: 1,
      totalAfterDiscount: 1
    });

    let totalPrice = 0;
    for (const item of orderSuccess) {
      totalPrice += item.totalAfterDiscount;
    }

    const totalOrder = await Order.countDocuments({});

    const totalUser = await AccountClient.countDocuments({});

    const totalProduct = await Product.countDocuments({});

    res.json({
      code: "success",
      totalPrice: totalPrice,
      totalOrder: totalOrder,
      totalUser: totalUser,
      totalProduct: totalProduct
    });

  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error"
    })
  }
}