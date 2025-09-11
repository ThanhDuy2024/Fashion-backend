import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { AccountClient } from "../../models/accountClient.model";
import moment from "moment";
import { pagination } from "../../helpers/pagination.helper";

export const getAllAccountClient = async (req: admin, res: Response) => {
  try {
    const find:any = {
      deleted: false,
    }

    const { search_email, status, page } = req.query;

    if(search_email) {
      const regex = new RegExp(String(search_email));
      find.email = regex;
    };

    if(status === "active" || status === "inactive") {
      find.status = status;
    }

    let pageNumber:number = 1;

    if(page) {
      pageNumber = parseInt(String(page));
    };
    const countDocuments = await AccountClient.countDocuments(find);
    const paginationFeature = pagination(countDocuments, pageNumber);

    const account = await AccountClient.find(find).limit(paginationFeature.limit).skip(paginationFeature.skip);

    const finalData:any = [];

    for (const item of account) {
      const rawData:any = {
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        image: item.image,
        status: item.status,
      }

      rawData.createdAt = moment(item.createdAt).format("HH:mm DD/MM/YYYY");

      finalData.push(rawData);
    };

    res.json({
      code: "success",
      data: finalData,
      totalPage: paginationFeature.totalPage
    })
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}