import { Response } from "express"
import { admin } from "../../interface/admin.interface"
import { Categories } from "../../models/categories.model";

export const categoryCreate = async (req: admin, res: Response) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      const totalCategory = await Categories.countDocuments() + 1;
      req.body.position = totalCategory;
    }

    let flag = "ok";
    if (!req.body.parentCategoryId) {
      req.body.parentCategoryId = []
    } else {
      req.body.parentCategoryId = JSON.parse(req.body.parentCategoryId);
      req.body.parentCategoryId = new Set(req.body.parentCategoryId);
      req.body.parentCategoryId = Array.from(req.body.parentCategoryId);
      for (const item of req.body.parentCategoryId) {
        const check = await Categories.findOne({
          _id: item,
          deleted: false
        });

        if (!check) {
          res.status(404).json({
            code: "error",
            message: "The parent category has not been existed"
          });
          return;
        }
      }
    }


    req.body.createdBy = req.admin.id;
    req.body.updatedBy = req.admin.id;

    const newCategory = new Categories(req.body);
    newCategory.save();
    res.json({
      code: "success",
      message: "The category has been created!"
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "Your parent category id invalid!"
    })
  }
}