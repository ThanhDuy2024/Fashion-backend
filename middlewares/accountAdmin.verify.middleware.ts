import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { admin } from "../interface/admin.interface";
import { AccountAdmin } from "../models/accountAdmin.model";
import { Role } from "../models/role.model";
import client from "../configs/redis";

export const verifyAccount = async (req: admin, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.refreshToken;
    const verifyToken = jwt.verify(String(token), String(process.env.JWT_REFRESH_TOKEN)) as JwtPayload;
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
    };

    const tokenUnique = await client.get(String(check.email));

    if(tokenUnique != token) {
      res.clearCookie("refreshToken");
      res.redirect("http://localhost:5173/admin/login");
      return;
    }

    const finalData:any = {
      id: check.id,
      fullName: check.fullName,
      email: check.email,
      image: check.image ? check.image : "",
      phone: check.phone ? check.phone : "",
      address: check.address ? check.address : "",
      role: "",
      status: check.status,
      permission: [],
    }

    const role = await Role.findOne({
      _id: check.roleId,
      deleted: false,
      status: "active"
    })

    if(role) {
      finalData.role = {
        roleId: role.id,
        roleName: role.name
      }
      finalData.permission = role.permission
    }


    req.admin = finalData;

    next();
  } catch (error) {
    console.log(error);
    res.json({
      code: "error",
      message: "Token invalid!"
    });
  }
}