import { Request, Response } from "express";
import moment from "moment";
import { Categories } from "../../models/categories.model";
import categoryTree from "../../helpers/category.helper";
import { getAllChildrenCategory } from "../../helpers/category.helper";
import { Product } from "../../models/product.model";
import { Style } from "../../models/style.model";
import { paginationCLient } from "../../helpers/pagination.helper";
import slugify from "slugify";

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
      parentCategoryId: [],
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

    const { search, page, price, quantity } = req.query;

    //sort follow createAt
    const sort: any = {}

    if (price && (price === "desc" || price == "asc")) {
      sort.currentPrice = price;
    }

    if (quantity && (quantity == "desc" || quantity == "asc")) {
      sort.quantity = quantity;
    }

    sort.createdAt = "desc"
    //end sort follow createAt

    //search
    if (search) {
      const keyword = slugify(String(search), {
        lower: true
      });

      const regex = new RegExp(keyword);

      find.slug = regex;
    }
    //end search

    let pageNumber:number = 1;
    if(page) {
      pageNumber = parseInt(String(page));
    }
    const countDocuments = await Product.countDocuments(find);
    const pagination = paginationCLient(countDocuments, pageNumber);

    const product = await Product.find(find).sort(sort).limit(pagination.limit).skip(pagination.skip);

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
      totalPage: pagination.totalPage
    });

  } catch (error) {
    console.error(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}