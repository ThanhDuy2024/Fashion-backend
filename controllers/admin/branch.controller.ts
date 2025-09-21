import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Branch } from "../../models/branch.model";

export const createBranch = async (req: admin, res: Response) => {
  try {
    if(req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    };

    await Branch.create(req.body);

    console.log(req.body);
    res.json({
      code: "success",
      message: "Branch has been created!"
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
};