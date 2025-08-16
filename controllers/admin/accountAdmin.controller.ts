import { Request, Response } from "express";
import { AccountAdmin } from "../../models/accountAdmin.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const register = async (req: Request, res: Response) => {
  const check = await AccountAdmin.findOne({
    email: req.body.email,
  });

  if(check) {
    res.status(400).json({
      code: "error",
      message: "Your email has been registered!"
    });
    return;
  };

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(String(req.body.password), salt);

  req.body.password = hash;
  
  const newAccount = new AccountAdmin(req.body);
  await newAccount.save();
  
  res.json({
    code: "success",
    message: "Your account has been registered!"
  })
}

export const login = async (req: Request, res: Response) => {
  const {email, password} = req.body;

  const check = await AccountAdmin.findOne({
    email: email,
    deleted: false,
    status: "active"
  });

  if(!check) {
    res.status(404).json({
      code: "error",
      message: "your email has not been registered!"
    });
    return;
  }

  const hash = bcrypt.compareSync(String(password), String(check.password));

  if(!hash) {
    res.status(404).json({
      code: "error",
      message: "Your password incorrect!"
    });
    return;
  }

  const accessToken = jwt.sign({
    fullName: check.fullName,
    email: check.email
  }, String(process.env.JWT_ACCESS_TOKEN), {
    expiresIn: 1 * 60 * 1000
  });

  const refreshToken = jwt.sign({
    fullName: check.fullName,
    email: check.email
  }, String(process.env.JWT_REFRESH_TOKEN), {
    expiresIn: 2 * 60 * 1000
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 2 * 60 * 1000,
    secure: true,
    sameSite: "none"
  })
  res.json({
    code: "success",
    message: "Login has been completed!",
    accessToken: accessToken,
  })
}

export const profile = async (req: Request, res: Response) => {
  res.json({
    code: "success",
    message: "Get profile complete"
  })
}