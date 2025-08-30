import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Style } from "../../models/style.model";
import { AccountAdmin } from "../../models/accountAdmin.model";
import * as paginationFeature from "../../helpers/pagination.helper";
import moment from "moment";
import slugify from "slugify";

export const styleCreate = async (req: admin, res: Response) => {
  const { name } = req.body;

  const check = await Style.findOne({
    name: name,
    deleted: false,
  })

  if (check) {
    res.status(400).json({
      code: "success",
      message: "The style name has been existed in your store!"
    });
    return;
  }

  req.body.createdBy = req.admin.id;
  req.body.updatedBy = req.admin.id;

  const newRecord = new Style(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "The style has been created!"
  })
}

export const styleList = async (req: admin, res: Response) => {
  const find: any = {
    deleted: false
  }

  const { search, status, page } = req.query;
  //search 
  if(search) {
    const keyword = slugify(String(search), {
      lower:true
    });

    const regex = new RegExp(keyword);
    find.slug = regex;
  }
  //end search

  //status fillter
  if(status == "active" || status == "inactive") {
    find.status = status;
  }
  //end status fillter

  //pagination
  let pageNumber:number = 1
  if(page) {
    pageNumber = parseInt(String(page));
  }
  const countDocuments = await Style.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);
  //end pagination
  const record = await Style.find(find).sort({
    createdAt: "desc",
  }).limit(pagination.limit).skip(pagination.skip);

  const finalData = []

  for (const item of record) {
    const rawData: any = {
      name: item.name,
      status: item.status,
      createdByFormat: "",
      updatedByFormat: "",
    }

    if (item.createdBy) {
      const check = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      })

      if (check) {
        rawData.createdByFormat = check.fullName;
      }
    }

    if (item.updatedBy) {
      const check = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      })

      if (check) {
        rawData.updatedByFormat = check.fullName;
      }
    }

    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");
    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    finalData.push(rawData);
  }


  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage,
  })
}