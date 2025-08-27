import { Request, Response } from "express";
import { AccountAdmin } from "../../models/accountAdmin.model";
import bcrypt from "bcryptjs";
import jwt, { JwtHeader, JwtPayload } from "jsonwebtoken";
import { admin } from "../../interface/admin.interface";

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
    expiresIn: "5h"
  });

  const refreshToken = jwt.sign({
    fullName: check.fullName,
    email: check.email
  }, String(process.env.JWT_REFRESH_TOKEN), {
    expiresIn: 30 * 24 * 60 * 60 * 1000
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: "none"
  })
  res.json({
    code: "success",
    message: "Login has been completed!",
    accessToken: accessToken,
  })
}

export const profile = async (req: admin, res: Response) => {
  const finalData = {
    fullName: req.admin.fullName,
    email: req.admin.email,
    image: req.admin.image ? req.admin.image : "",
    phone: req.admin.phone ? req.admin.phone : "",
    address: req.admin.address ? req.admin.address : "",
    roleName: req.admin.roleName,
    permission: req.admin.permission,
    status: req.admin.status,
  }

  res.json({
    code: "success",
    data: finalData
  })
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if(!refreshToken) {
      res.status(404).json({
        code: "error",
        message: "Your token is expired!"
      });
      return;
    }

    const verify = jwt.verify(String(refreshToken), String(process.env.JWT_REFRESH_TOKEN)) as JwtPayload;

    const check = await AccountAdmin.findOne({
      email: verify.email,
      deleted: false,
      status: "active"
    });

    if(!check) {
      res.clearCookie("refreshToken", refreshToken);
      res.status(404).json({
        code: "error",
        message: "Verify refresh token error!"
      });
      return;
    }

    const accessToken = jwt.sign({
      fullName: check.fullName,
      email: check.email,
    }, String(process.env.JWT_ACCESS_TOKEN), {
      expiresIn: "1h"
    })

    res.json({
      code: "success",
      message: "Refresh token has been completed!",
      accessToken: accessToken
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Refresh token expire in!"
    });
  }
}