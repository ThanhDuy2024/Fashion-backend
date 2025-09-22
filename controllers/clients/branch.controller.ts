import { Request, Response } from "express";
import { Branch } from "../../models/branch.model";

export const getAllBranch = async (req: Request, res: Response) => {
  try {
    const branch = await Branch.find({
      status: "active"
    });
    
    res.json({
      code: "success",
      data: branch,
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}