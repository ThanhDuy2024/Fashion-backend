import { Request, Response } from "express";
import { AccountClient } from "../../models/accountClient.model";
import bcrypt from "bcryptjs";
import { OtpEmail } from "../../models/otpEmail.model";
import { randomString } from "../../helpers/randomString.helper";
import { sendOtp } from "../../helpers/nodemailer.helper";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const checkEmail = await AccountClient.findOne({
      email: email,
    });

    if (checkEmail) {
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

    sendOtp(req.body.email, req.body.otp);

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

export const confirmEmail = async (req: Request, res: Response) => {
  try {
    const otpCheck = await OtpEmail.findOne({
      otp: req.body.otp
    });

    if (!otpCheck) {
      return res.status(404).json({
        code: "error",
        message: "Your otp is not found!"
      });
    }

    await AccountClient.create({
      fullName: otpCheck.fullName,
      email: otpCheck.email,
      password: otpCheck.password
    });

    await OtpEmail.deleteOne({
      otp: req.body.otp
    });

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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const checkEmail = await AccountClient.findOne({
      email: email,
      deleted: false,
      status: "active"
    });

    if (!checkEmail) {
      return res.status(404).json({
        code: "error",
        messgae: "Your email is not found!"
      });
    };

    const checkPassword = bcrypt.compareSync(password, String(checkEmail.password));

    if (!checkPassword) {
      return res.status(404).json({
        code: "error",
        messgae: "Your password is incorrected!!"
      });
    };

    const token = jwt.sign({ fullName: checkEmail.fullName, email: checkEmail.email }, String(process.env.JWT_USER_TOKEN), {
      expiresIn: "30d"
    });

    res.cookie("userToken", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: false,
      sameSite: "lax"
    })
    res.json({
      code: "success",
      message: "Login is completed"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      messgae: error
    })
  }
}

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("userToken");
    res.json({
      code: "success",
      message: "Logout completed!"
    })
  } catch (error) {
    console.error(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}