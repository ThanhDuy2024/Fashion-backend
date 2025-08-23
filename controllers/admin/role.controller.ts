import { Response } from "express";
import { admin } from "../../interface/admin.interface";

export const roleCreate = (req: admin, res: Response) => {
  res.json({
    code: "success",
    message: "Role has been completed!"
  })
}