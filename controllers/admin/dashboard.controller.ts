import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Order } from "../../models/order.model";
import moment, { months } from "moment";
const currentYear = new Date().getFullYear();
export const dashboardOrder = async (req: admin, res: Response) => {
  try {
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
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}