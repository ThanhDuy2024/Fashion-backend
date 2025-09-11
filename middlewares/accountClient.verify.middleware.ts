import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AccountClient } from "../models/accountClient.model";
import { client } from "../interface/client.interface";
export const verify = async (req: client, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.userToken;
    const verifyToken = jwt.verify(String(token), String(process.env.JWT_USER_TOKEN)) as JwtPayload;
    
    if(!verifyToken) {
      return res.status(400).json({
        code: "error",
        message: "Token invalid!"
      });
    }

    const account = await AccountClient.findOne({
      email: verifyToken.email,
      deleted: false,
      status: "active"
    });

    if(!account) {
      return res.status(404).json({
        code: "error",
        message: "Account is not found!"
      });
    };

    const finalData:any = {
      fullName: account.fullName,
      email: account.email,
      image: account.image || "",
      phone: account.phone || "",
      address: account.address || "",
      birthDay: account.birthDay || "",
      bankCode: account.bankCode || "",
    }

    req.client = finalData;
    console.log(req.client);
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    });
  }
}