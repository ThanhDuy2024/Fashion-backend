import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Style } from "../../models/style.model";

export const styleCreate = async (req: admin, res: Response) => {
  const { name } = req.body;

  const check = await Style.findOne({
    name: name,
    deleted: false,
  })

  if(check) {
    res.status(400).json({
      code: "success",
      message: "The style name has been existed in your store!"
    });
    return;
  }

  const newRecord = new Style(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "The style has been created!"
  })
}
