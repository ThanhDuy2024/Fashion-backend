import { Request, Response } from "express";
import { AccountClient } from "../../models/accountClient.model";
import bcrypt from "bcryptjs";

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
    await AccountClient.create(req.body);

    res.json({
      code: "success",
      message: "Your account has been registered!"
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    });
  }
}