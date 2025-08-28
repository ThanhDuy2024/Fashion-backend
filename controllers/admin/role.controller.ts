import { raw, Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Role } from "../../models/role.model";
import { categoryPermission } from "../../enums/categoryPermission";
import moment from "moment";
import { AccountAdmin } from "../../models/accountAdmin.model";
import * as paginationFeature from "../../helpers/pagination.helper";
import slugify from "slugify";

export const roleCreate = async (req: admin, res: Response) => {
  const { name, permission } = req.body;

  const check = await Role.findOne({
    name: name,
  })

  if(check) {
    res.status(400).json({
      code: "error",
      message: "Role name has been existed!"
    });
    return;
  }

  const permissionArray = Object.values(categoryPermission);

  let ok;
  permission.forEach((item:any) => {
    const permissionCheck = permissionArray.includes(item);
    if(!permissionCheck) {
      ok = false
    }
  });

  if(ok === false) {
    res.status(400).json({
      code: "error"
    });
    return;
  }

  req.body.createdBy = req.admin.id;
  req.body.updatedBy = req.admin.id;

  const newRole = new Role(req.body);

  await newRole.save();

  res.json({
    code: "success",
    message: "Role has been completed!"
  })
}

export const roleList = async (req: admin, res: Response) => {
  const find:any = {
    deleted: false
  }

  const { search, status, page } = req.query;
  //search
  if(search) {
    const keyword = slugify(String(search), {
      lower: true
    });
    const regex = new RegExp(keyword);
    find.slug = regex;
  }
  //end search

  //status
  if(status) {
    find.status = status;
  }
  //end status

  //pagination
  let pageNumber:Number = 1;
  if(page) {
    pageNumber = parseInt(String(page));
  }
  const countDocuments = await Role.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, parseInt(String(pageNumber)));
  //end pagination
  const role = await Role.find(find).limit(pagination.limit).skip(pagination.skip)
    .sort({
      createdAt: "desc"
    });
  
  const finalData:any = []

  for (const item of role) {
    const rawData:any = {
      id: item.id,
      name: item.name,
      permission: item.permission,
      status: item.status,
      createdByFormat: "",
      updatedByFormat: ""
    }

    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");

    if(item.createdBy) {
      const account = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      })

      if(account) {
        rawData.createdByFormat = account.fullName;
      }
    }

    if(item.updatedBy) {
      const account = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      })

      if(account) {
        rawData.updatedByFormat = account.fullName;
      }
    }

    finalData.push(rawData);
  }
  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage
  })
}
