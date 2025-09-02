import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Coupon } from "../../models/coupon.model";
import moment from "moment";
import { AccountAdmin } from "../../models/accountAdmin.model";

export const create = async (req: admin, res: Response) => {
  const { name, startDay, endDay } = req.body
  const check = await Coupon.findOne({
    name: name,
  });

  if(check) {
    return res.status(400).json({
      code: "error",
      message: "A coupon name has been existed!"
    });
  }

  const start = moment(startDay, "YYYY-MM-DD");
  const end = moment(endDay, "YYYY-MM-DD");

  const totalDays = end.diff(start, "days");

  req.body.startDate = new Date(String(start));
  req.body.endDate = new Date(String(end));
  req.body.discount = parseInt(String(req.body.discount));
  req.body.createdBy = req.admin.id;
  req.body.updatedBy = req.admin.id;
  req.body.expireAt = Date.now() + parseInt(String(totalDays)) * 24 * 60 * 60 * 1000; 

  await Coupon.create(req.body);

  res.json({
    code: "success",
    message: "A coupon has been created!"
  });
}

export const list = async (req: admin, res: Response) => {
  const find:any = {};
  const record = await Coupon.find(find).sort({
    created: "desc",
  })

  const finalData:any = [];
  for (const item of record) {
    const rawData:any = {
      id: item.id,
      name: item.name,
      createdByFormat: "",
      updatedByFornat: "",
    }

    if(item.createdBy) {
      const check = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      });

      if(check) {
        rawData.createdByFormat = check.fullName
      }
    }

    if(item.updatedBy) {
      const check = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      });

      if(check) {
        rawData.updatedByFornat = check.fullName
      }
    }

    rawData.startDateFormat = moment(item.startDate).format("DD-MM-YYYY");
    rawData.endDateFormat = moment(item.endDate).format("DD-MM-YYYY");

    finalData.push(rawData);
  }
  res.json({
    code: "success",
    data: finalData
  })
}