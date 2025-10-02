import { Response } from "express";
import { admin } from "../../interface/admin.interface";

export const dashboard = (req: admin, res: Response) => {
  try {
    res.json({
      code: "success",
      message: "dashboar api"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}