import { Request, Response } from "express";
import { AccountAdmin } from "../../models/accountAdmin.model";
import bcrypt from "bcryptjs";
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