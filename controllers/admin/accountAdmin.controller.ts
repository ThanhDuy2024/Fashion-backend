import { Request, Response } from "express";

export const register = (req: Request, res: Response) => {
  res.json({
    code: "success",
    message: "Your account has been register"
  })
}