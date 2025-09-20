import { Request, Response } from "express";
import slugify from "slugify";
import { Product } from "../../models/product.model";
import { paginationCLient } from "../../helpers/pagination.helper";
import { Style } from "../../models/style.model";
import { Categories } from "../../models/categories.model";

const skip = 0;
const limit = 4;
export const getAllProduct = async (req: Request, res: Response) => {
  try {
    const find: any = {
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

    let pageNumber: number = 1;
    if (page) {
      pageNumber = parseInt(String(page));
    }
    const countDocuments = await Product.countDocuments(find);
    const pagination = paginationCLient(countDocuments, pageNumber, skip, limit);

    const product = await Product.find(find).sort(sort).limit(pagination.limit).skip(pagination.skip);

    const finalData: any = [];

    for (const item of product) {
      const rawData: any = {
        id: item.id,
        name: item.name,
        image: item.image || "",
        originPrice: item.originPrice,
        currentPrice: item.currentPrice,
      };

      rawData.originPriceFormat = rawData.originPrice.toLocaleString("vi-VN");
      rawData.currentPriceFormat = rawData.currentPrice.toLocaleString("vi-VN");

      finalData.push(rawData);
    }
    res.json({
      code: "success",
      data: finalData,
      totalPage: pagination.totalPage
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const getProductDeatail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const item = await Product.findOne({
      _id: id,
      deleted: false,
      status: "active",
    });

    if (!item) {
      return res.status(404).json({
        code: "error",
        message: "Product is not found!"
      });
    }

    const finalData: any = {
      id: item.id,
      name: item.name,
      image: item.image || "",
      categoryIds: [],
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

    finalData.originPriceFormat = finalData.originPrice.toLocaleString("vi-VN");
    finalData.currentPriceFormat = finalData.currentPrice.toLocaleString("vi-VN");

    if (item.styleId) {
      const check = await Style.findOne({
        _id: item.styleId,
        deleted: false,
        status: "active",
      });

      if (check) {
        finalData.styleName = check.name;
      }
    }
    
    if(item.categoryIds) {
      for (const c of item.categoryIds) {
        const check = await Categories.findOne({
          _id: c,
          deleted: false,
          status: "active"
        });

        if(check) {
          finalData.categoryIds.push({
            id: check.id,
            name: check.name
          });
        }
      }
    };

    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    console.error(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}