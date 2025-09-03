import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Coupon } from "../../models/coupon.model";
import moment from "moment";
import { AccountAdmin } from "../../models/accountAdmin.model";
import * as paginationFeature from "../../helpers/pagination.helper";
import slugify from "slugify";

export const create = async (req: admin, res: Response) => {
  const { name, startDay, endDay, status } = req.body
  const check = await Coupon.findOne({
    name: name,
  });

  if (check) {
    return res.status(400).json({
      code: "error",
      message: "A coupon name has been existed!"
    });
  }

  if (status !== "active" && status !== "inactive") {
    return res.status(400).json({
      code: "error",
      message: "Status must active or inactive!"
    })
  }

  const start = moment(startDay, "YYYY-MM-DD");
  const end = moment(endDay, "YYYY-MM-DD");

  const totalDays = end.diff(start, "days");

  req.body.startDate = new Date(String(start));
  req.body.endDate = new Date(String(end));
  req.body.discount = parseInt(String(req.body.discount));
  req.body.createdBy = req.admin.id;
  req.body.updatedBy = req.admin.id;
  req.body.expireAt = new Date(Date.now() + parseInt(String(totalDays)) * 24 * 60 * 60 * 1000);

  await Coupon.create(req.body);

  res.json({
    code: "success",
    message: "A coupon has been created!"
  });
}

export const list = async (req: admin, res: Response) => {
  const find: any = {};

  const { search, page, status } = req.query;

  //search
  if (search) {
    const keyword = slugify(String(search), {
      lower: true
    });

    const regex = new RegExp(keyword);

    find.slug = regex;
  }
  //end search

  //status
  if (status === "active" || status === "inactive") {
    find.status = status;
  }
  //end status


  //pagination
  let pageNumber: number = 1;
  if (page) {
    pageNumber = parseInt(String(page));
  }
  const countDocuments = await Coupon.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);
  //end pagination

  const record = await Coupon.find(find).sort({
    created: "desc",
  }).limit(pagination.limit).skip(pagination.skip);

  const finalData: any = [];
  for (const item of record) {
    const rawData: any = {
      id: item.id,
      name: item.name,
      createdByFormat: "",
      updatedByFornat: "",
    }

    if (item.createdBy) {
      const check = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      });

      if (check) {
        rawData.createdByFormat = check.fullName
      }
    }

    if (item.updatedBy) {
      const check = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      });

      if (check) {
        rawData.updatedByFornat = check.fullName
      }
    }

    rawData.startDateFormat = moment(item.startDate).format("DD-MM-YYYY");
    rawData.endDateFormat = moment(item.endDate).format("DD-MM-YYYY");

    finalData.push(rawData);
  }
  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage
  })
}

export const detail = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Coupon.findOne({
      _id: id
    });

    if (!check) {
      return res.status(404).json({
        code: "error",
        message: "The coupon is not found!"
      })
    }

    const finalData: any = {
      id: check.id,
      name: check.name,
      discount: String(check.discount) + "%",
      startDateFormat: "",
      endDateFormat: "",
      status: check.status,
    }

    finalData.startDateFormat = moment(check.startDate).format("DD/MM/YYYY");
    finalData.endDateFormat = moment(check.endDate).format("DD/MM/YYYY");

    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "The coupon is not found!"
    })
  }
}

export const edit = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const { name, discount, startDay, endDay, status } = req.body;

    if(status !== "active" && status !== "inactive") {
      return res.status(400).json({
        code: "error",
        message: "Status only active or inactive!"
      })
    }

    const check = await Coupon.findOne({
      _id: id,
    })

    if (!check) {
      return res.status(404).json({
        code: "error",
        message: "A coupon is not found!"
      })
    }

    if (name !== check.name) {
      const checkName = await Coupon.findOne({
        _id: { $ne: id },
        name: name,
      });

      if (checkName) {
        return res.status(400).json({
          code: "error",
          message: "Coupon name has been existed!"
        })
      }
    }

    const start = moment(startDay, "YYYY-MM-DD")
    const end = moment(endDay, "YYYY-MM-DD")
    let checkStartDay = moment(check.startDate, "YYYY-MM-DD")
    let checkEndDay = moment(check.endDate, "YYYY-MM-DD");

    if(start !== checkStartDay) {
      checkStartDay = start;
    }

    if(end !== checkEndDay) {
      checkEndDay = end;
    }

    const totalDurations = checkEndDay.diff(checkStartDay, "days");
    req.body.startDate = checkStartDay;
    req.body.endDate = checkEndDay;
    req.body.expireAt = new Date(Date.now() + parseInt(String(totalDurations)) * 24 * 60 * 60 * 1000);
    req.body.updatedBy = req.admin.id
    req.body.discount = parseInt(discount);

    await Coupon.updateOne({
      _id: check.id,
    }, req.body);
    

    res.json({
      code: "success",
      message: "A coupon has been edited!"
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "A coupon is not found!"
    })
  }
}

//fix status in create in all controller