import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Order } from "../../models/order.model";
import { paymentStatusVariable, statusVariable } from "../../configs/paymentVariable";
import { pagination } from "../../helpers/pagination.helper";
import moment from "moment";

export const getAllOrder = async (req: admin, res: Response) => {
  try {
    const find:any = {
      deleted: false
    };

    const { search, price, paymentStatus, status, page} = req.query;

    if(search) {
      find._id = search;
    }

    const sort:any = {};

    if(price) {
      sort.totalAfterDiscount = price;
    };

    if(paymentStatus) {
      find.paymentStatus = paymentStatus;
    };

    if(status) {
      find.status = status;
    };

    let pageNumber:number = 1;
    if(page) {
      pageNumber = parseInt(String(page));
    };
    const countDocument = await Order.countDocuments(find);
    const paginationFeature = pagination(countDocument, pageNumber); 

    const order = await Order.find(find).sort(sort).limit(paginationFeature.limit).skip(paginationFeature.skip);

    const finalData:any = []

    for (const item of order) {
      const rawData:any = {
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