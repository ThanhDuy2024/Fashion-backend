import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { admin } from "../interface/admin.interface";
import { AccountAdmin } from "../models/accountAdmin.model";
import { Role } from "../models/role.model";

export const verifyAccount = async (req: admin, res: Response, next: NextFunction) => {
  try {
    const accessToken = req.headers.authorization;
    const verifyToken = jwt.verify(String(accessToken), String(process.env.JWT_ACCESS_TOKEN)) as JwtPayload;
    const check = await AccountAdmin.findOne({
      email: verifyToken.email,
      deleted: false,
      status: "active",
    });

    if (!check) {
      res.status(404).json({
        code: "error",
        message: "Your token is broken!"
      });
      return;
    }

    const finalData:any = {
      id: check.id,
      fullName: check.fullName,
      email: check.email,
      image: check.image ? check.image : "",
      phone: check.phone ? check.phone : "",
      address: check.address ? check.address : "",
      roleName: "",
      status: check.status,
      permission: [],
    }

    const role = await Role.findOne({
      _id: check.roleId,
      deleted: false,
      status: "active"
    })

    if(role) {
      finalData.roleName = role.name
      finalData.permission = role.permission
    }


    req.admin = finalData;

    next();
  } catch (error) {
    res.json({
      code: "error",
      message: "Token invalid!"
    });
  }
}