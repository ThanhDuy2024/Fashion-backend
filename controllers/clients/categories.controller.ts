import { Request, Response } from "express";
import moment from "moment";
import { Categories } from "../../models/categories.model";
import categoryTree from "../../helpers/category.helper";

export const categoriesTree = async (req: Request, res: Response) => {

  const find: any = {
    deleted: false,
    status: "active"
  }
  //end search

  const record = await Categories.find(find)

  const data: any = []

  for (const item of record) {
    const rawData: any = {
      id: item.id,
      name: item.name,
      image: item.image ? item.image : "",
      parentCategoryId: [],
      status: item.status,
      createdAtFormat: "",
      updatedAtFormat: "",
    }

    for (const parent of item.parentCategoryId) {
      const check = await Categories.findOne({
        _id: parent,
        deleted: false,
        status: "active"
      })

      if (check) {
        rawData.parentCategoryId.push(check.id);
      }
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