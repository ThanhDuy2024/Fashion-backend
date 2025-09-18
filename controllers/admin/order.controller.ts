import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Order } from "../../models/order.model";
import { paymentMethodVariable, paymentStatusVariable, statusVariable } from "../../configs/paymentVariable";
import { pagination } from "../../helpers/pagination.helper";
import moment from "moment";
import { AccountClient } from "../../models/accountClient.model";

export const getAllOrder = async (req: admin, res: Response) => {
  try {
    const find: any = {
      deleted: false
    };

    const { search, price, paymentStatus, status, page } = req.query;

    if (search) {
      find._id = search;
    }

    const sort: any = {};

    if (price) {
      sort.totalAfterDiscount = price;
    };

    if (paymentStatus) {
      find.paymentStatus = paymentStatus;
    };

    if (status) {
      find.status = status;
    };

    let pageNumber: number = 1;
    if (page) {
      pageNumber = parseInt(String(page));
    };
    const countDocument = await Order.countDocuments(find);
    const paginationFeature = pagination(countDocument, pageNumber);

    const order = await Order.find(find).sort(sort).limit(paginationFeature.limit).skip(paginationFeature.skip);

    const finalData: any = []

    for (const item of order) {
      const rawData: any = {
        id: item.id,
        orderList: item.orderList,
        totalAfterDiscount: item.totalAfterDiscount,
        paymentStatus: "",
        status: "",
        createdAt: "",
      };

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
      totalPage: paginationFeature.totalPage,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const orderDetail = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const item = await Order.findOne({
      _id: id,
      deleted: false
    });

    if (!item) {
      return res.status(404).json({
        code: "error",
        message: "Order is not found!"
      });
    };

    const finalData: any = {
      _id: item.id,
      userInfor: {},
      address: item.address,
      phone: item.phone,
      orderList: item.orderList,
      coupon: item.coupon,
      discount: item.discount,
      totalOrder: item.totalOrder,
      totalAfterDiscount: item.totalAfterDiscount,
      paymentStatus: {},
      paymentMethod: {},
      status: {},
      createdAt: "",
      updatedAt: "",
      __v: 0
    }

    if(item.paymentStatus) {
      const findItem = paymentStatusVariable.find(v => v.key === item.paymentStatus);
      finalData.paymentStatus = findItem;
    }

    if(item.paymentMethod) {
      const findItem = paymentMethodVariable.find(v => v.key === item.paymentMethod);
      finalData.paymentMethod = findItem;
    }

    if(item.status) {
      const findItem = statusVariable.find(v => v.key === item.status);
      finalData.status = findItem;
    }

    if(item.createdAt) {
      finalData.createdAt = moment(item.createdAt).format("HH:m DD/MM/YYYY");
    };

    if(item.updatedAt) {
      finalData.updatedAt = moment(item.updatedAt).format("HH:m DD/MM/YYYY");
    };

    if(item.userId) {
      const account = await AccountClient.findOne({
        _id: item.userId,
        deleted: false
      });

      if(account) {
        finalData.userInfor = {
          id: account.id,
          name: account.fullName,
          email: account.email
        }
      } else {
        finalData.userInfor = "Not data"
      }
    }
    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    console.log(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}

export const updateOrder = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const item = await Order.findOne({
      _id: id,
      deleted: false,
    });

    if(!item) {
      return res.status(404).json({
        code: "error",
        message: "Order is not found!"
        });
    };

    const { paymentStatus, status } = req.query;

    if(paymentStatus) {
      await Order.updateOne({
        _id: id,
      }, {
        paymentStatus: paymentStatus,
        updatedBy: req.admin.id,
      })
    };

    if(status) {
      await Order.updateOne({
        _id: id
      }, {
        status: status,
        updatedBy: req.admin.id
      });
    };


    res.json({
      code: "success",
      message: "Order has been updated!"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}