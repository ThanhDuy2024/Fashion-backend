import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { admin } from "../interface/admin.interface";
import { AccountAdmin } from "../models/accountAdmin.model";

export const verifyAccount = async (req: admin, res: Response, next: NextFunction) => {
  const accessToken = req.headers.authorization;
  try {
    const verifyToken = jwt.verify(String(accessToken), String(process.env.JWT_ACCESS_TOKEN)) as JwtPayload;
    const check = await AccountAdmin.findOne({
      email: verifyToken.email,
      deleted: false,
      status: "active",
    });

    if(!check) {
      res.status(404).json({
        code: "error",
        message: "Your token is broken!"
      });
      return;
    }

    req.admin = check;

    next();
  } catch (error) {
    res.json({
      code: "error",
      message: "Token invalid!"
    });
  }
}