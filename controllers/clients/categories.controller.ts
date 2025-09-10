import { Request, Response } from "express";
import moment from "moment";
import { Categories } from "../../models/categories.model";
import categoryTree from "../../helpers/category.helper";
import { getAllChildrenCategory } from "../../helpers/category.helper";
import { Product } from "../../models/product.model";
import { Style } from "../../models/style.model";

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

export const getProductInCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const categories = await Categories.find({
      deleted: false,
      status: "active"
    })
    const categoryArray = getAllChildrenCategory(String(id), categories);

    const find: any = {
      categoryIds: { $in: categoryArray },
      deleted: false,
      status: "active"
    }

    const sort: any = {

    }

    const product = await Product.find(find).sort(sort);

    const finalData: any = [];

    for (const item of product) {
      const rawData: any = {
        id: item.id,
        name: item.name,
        image: item.image || "",
        categoryIds: item.categoryIds,
        sex: item.sex,
        styleName: "",
        season: item.season,
        size: item.size,
        material: item.material,
        quantity: item.quantity,
        originPrice: item.originPrice,
        currentPrice: item.currentPrice,
        orginOfProduction: item.orginOfProduction,
      };

      rawData.originPriceFormat = rawData.originPrice.toLocaleString("vi-VN");
      rawData.currentPriceFormat = rawData.currentPrice.toLocaleString("vi-VN");

      if(item.styleId) {
        const check = await Style.findOne({
          _id: item.styleId,
          deleted: false,
          status: "active",
        });

        if(check) {
          rawData.styleName = check.name;
        }
      }

      finalData.push(rawData);
    }
    res.json({
      code: "success",
      data: finalData,
    });

  } catch (error) {
    console.error(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}