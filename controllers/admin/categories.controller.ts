import { Response } from "express"
import { admin } from "../../interface/admin.interface"
import { Categories } from "../../models/categories.model";
import moment from "moment";
import categoryTree from "../../helpers/category.helper";

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

export const categoryList = async (req: admin, res: Response) => {
  const find:any = {
    deleted: false
  }
  const record = await Categories.find(find)
    .sort({
      position: "desc"
    });
  
  const data:any = []
  
  for (const item of record) {
    const rawData:any = {
      id: item.id,
      name: item.name,
      image: item.image ? item.image : "",
      status: item.status,
      parentCategoryId: item.parentCategoryId,
      createdAtFormat: "",
      updatedAtFormat: "",
    }

    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");

    data.push(rawData);
  }

  const dataFinal = categoryTree(data);

  res.json({
    code: "success",
    data: dataFinal
  })
}