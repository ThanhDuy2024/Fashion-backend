import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Coupon } from "../../models/coupon.model";
import moment from "moment";

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


  req.body.discount = parseInt(String(req.body.discount));
  req.body.createdBy = req.admin.id;
  req.body.expireAt = Date.now() + parseInt(String(totalDays)) * 24 * 60 * 60 * 1000; 

  await Coupon.create(req.body);

  res.json({
    code: "success",
    message: "A coupon has been created!"
  });
}