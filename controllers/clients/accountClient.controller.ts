import { Request, Response } from "express";
import { AccountClient } from "../../models/accountClient.model";
import bcrypt from "bcryptjs";
import { OtpEmail } from "../../models/otpEmail.model";
import { randomString } from "../../helpers/randomString";
export const register = async (req: Request, res: Response) => {
  try {
    const {email, password} = req.body;
    
    const checkEmail = await AccountClient.findOne({
      email: email,
    });

    if(checkEmail) {
      return res.status(400).json({
        code: "error",
        message: "Your email has been existed!"
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(String(password), salt);
    req.body.password = hash;
    req.body.expireAt = new Date(Date.now() + 5 * 60 * 1000);
    req.body.otp = randomString(10);
    await OtpEmail.create(req.body);

    res.json({
      code: "success",
      message: "Otp is sending in your email!"
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    });
  }
}