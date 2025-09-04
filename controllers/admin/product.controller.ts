import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Categories } from "../../models/categories.model";
import { Style } from "../../models/style.model";
import * as checkSeaon from "../../enums/season";
import * as checkSize from "../../enums/size";
import { Product } from "../../models/product.model";

export const create = async (req: admin, res: Response) => {
  try {
    const { categoryIds, styleId, season, size, quantity, originPrice, currentPrice, orginOfProduction } = req.body;

    if (categoryIds) {
      req.body.categoryIds = JSON.parse(categoryIds);
      req.body.categoryIds = new Set(req.body.categoryIds);
      req.body.categoryIds = Array.from(req.body.categoryIds);
    } else {
      req.body.categories = [];
    }

    for (const item of req.body.categoryIds) {
      const check = await Categories.findOne({
        _id: item,
        deleted: false,
        status: "active"
      });

      if (!check) {
        return res.status(400).json({
          code: "error",
          message: "Some category is not found in data!"
        })
      }
    }

    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    const checkStyleId = await Style.findOne({
      _id: styleId,
      deleted: false,
      status: "active"
    })

    if (!checkStyleId) {
      return res.status(404).json({
        code: "error",
        message: "Some style is not found in data!"
      })
    }

    if (season) {
      const checkSeaonArray = Object.values(checkSeaon.season);
      if (!checkSeaonArray.includes(season)) {
        return res.status(404).json({
          code: "error",
          message: "Season is not found in data!"
        })
      }
    }

    req.body.size = JSON.parse(size);
    req.body.size = new Set(req.body.size); //khi set lai thi no thanh mot object
    req.body.size = Array.from(req.body.size);

    const checkSizeArray = Object.values(checkSize.sizeEnum);
    for (const item of req.body.size) {
      if (!checkSizeArray.includes(item)) {
        return res.status(404).json({
          code: "error",
          message: "Some size is not found in data!"
        })
      }
    }

    req.body.quantity = parseInt(String(quantity));
    req.body.originPrice = parseInt(String(originPrice));
    req.body.currentPrice = parseInt(String(currentPrice));
    req.body.createdBy = req.admin.id,
    req.body.updatedBy = req.admin.id,

    await Product.create(req.body);
    res.json({
      code: "success",
      message: "Product has been created!"
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "Some item is not found in data!"
    })
  }
}