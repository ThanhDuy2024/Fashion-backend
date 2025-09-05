import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Categories } from "../../models/categories.model";
import { Style } from "../../models/style.model";
import * as checkSeaon from "../../enums/season";
import * as checkSize from "../../enums/size";
import { Product } from "../../models/product.model";
import { AccountAdmin } from "../../models/accountAdmin.model";
import * as paginationFeature from "../../helpers/pagination.helper";
import moment from "moment";
import slugify from "slugify";

export const create = async (req: admin, res: Response) => {
  try {
    const { categoryIds, styleId, season, size, quantity, originPrice, currentPrice } = req.body;

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

export const list = async (req: admin, res: Response) => {
  try {
    const find: any = {
      deleted: false
    };


    const { search, status, page, price, quantity } = req.query;

    //sort follow createAt
    const sort: any = {}

    if(price && (price === "desc" || price == "asc")) {
      sort.currentPrice = price;
    }

    if(quantity && (quantity == "desc" || quantity == "asc")) {
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

    //status filter
    if (status === "active" || status === "inactive") {
      find.status = status;
    }
    //end status filter


    //pagination
    let pageNumber: number = 1;
    if (page) {
      pageNumber = parseInt(String(page));
    };
    const countDocuments = await Product.countDocuments(find);
    const pagination = paginationFeature.pagination(countDocuments, pageNumber);

    //end pagination

    const product = await Product.find(find).limit(pagination.limit).skip(pagination.skip)
      .sort(sort);

    const finalData: any = [];

    for (const item of product) {
      const rawData: any = {
        id: item.id,
        name: item.name,
        image: item.image,
        status: item.status,
        quantity: item.quantity,
        currentPrice: item.currentPrice,
        createdByFormat: "",
        updatedByFormat: "",
      };

      if (item.createdBy) {
        const check = await AccountAdmin.findOne({
          _id: item.createdBy,
          deleted: false
        });

        if (check) {
          rawData.createdByFormat = check.fullName
        }
      }

      if (item.updatedBy) {
        const check = await AccountAdmin.findOne({
          _id: item.updatedBy,
          deleted: false
        });

        if (check) {
          rawData.updatedByFormat = check.fullName
        }
      }

      rawData.createAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY")
      rawData.updateAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY")

      finalData.push(rawData);
    }
    res.json({
      code: "success",
      data: finalData,
      totalPage: pagination.totalPage
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const deltail = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const check = await Product.findOne({
      _id: id,
      deleted: false
    });

    if(!check) {
      return res.status(404).json({
        code: "error",
        message: "Product is not found!"
      });
    };

    const finalData:any = {
      id: check.id,
      name: check.name,
      image: check.image,
      categoryIds: check.categoryIds,
      sex: check.sex,
      styleId: check.styleId,
      season: check.season,
      size: check.size,
      material: check.material,
      quantity: check.quantity,
      originPrice: check.originPrice,
      currentPrice: check.currentPrice,
      orginOfProduction: check.orginOfProduction,
      status: check.status,
      createdByFormat: "",
      updatedByFormat: "",
    };

    if(check.createdBy) {
      const account = await AccountAdmin.findOne({
        _id: check.createdBy,
        deleted: false
      });

      if(account) {
        finalData.createdByFormat = account.fullName;
      }
    }

    if(check.updatedBy) {
      const account = await AccountAdmin.findOne({
        _id: check.updatedBy,
        deleted: false
      });

      if(account) {
        finalData.updatedByFormat = account.fullName;
      }
    }

    finalData.createAtFormat = moment(check.createdAt).format("HH:mm DD/MM/YYYY")
    finalData.updatedAtFormat = moment(check.updatedAt).format("HH:mm DD/MM/YYYY")

    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const edit = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const check = await Product.findOne({
      _id: id,
      deleted: false
    });

    if(!check) {
      return res.status(404).json({
        code: "error",
        message: "Product is not found!"
      });
    }

    const { categoryIds, styleId, season, size, quantity, originPrice, currentPrice } = req.body;

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
    req.body.updatedBy = req.admin.id,

    await Product.updateOne({
      _id: check.id
    }, req.body);

    res.json({
      code: "success",
      message: "Product has been edited!"
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "Some item is not found in data!"
    })
  }
}

export const deleteSoft = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const check = await Product.findOne({
      _id: id,
      deleted: false
    });

    if(!check) {
      return res.status(404).json({
        code: "error",
        message: "Product is not found!"
      });
    };

    await Product.updateOne({
      _id: id,
    }, {
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: req.admin.id
    })

    res.json({
      code: "success",
      message: "Product has been deleted!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const trashList = async (req: admin, res: Response) => {
  try {
    const find: any = {
      deleted: true
    };


    const { search, status, page } = req.query;

    //sort follow createAt
    const sort: any = {
      deletedAt: "desc"
    }

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

    //status filter
    if (status === "active" || status === "inactive") {
      find.status = status;
    }
    //end status filter


    //pagination
    let pageNumber: number = 1;
    if (page) {
      pageNumber = parseInt(String(page));
    };
    const countDocuments = await Product.countDocuments(find);
    const pagination = paginationFeature.pagination(countDocuments, pageNumber);

    //end pagination

    const product = await Product.find(find).limit(pagination.limit).skip(pagination.skip)
      .sort(sort);

    const finalData: any = [];

    for (const item of product) {
      const rawData: any = {
        id: item.id,
        name: item.name,
        image: item.image,
        status: item.status,
        quantity: item.quantity,
        currentPrice: item.currentPrice,
        deletedByFormat: "",
      };

      if (item.deletedBy) {
        const check = await AccountAdmin.findOne({
          _id: item.deletedBy,
          deleted: false
        });

        if (check) {
          rawData.deletedByFormat = check.fullName
        }
      }

      rawData.deletedAtFormat = moment(item.deletedAt).format("HH:mm DD/MM/YYYY")

      finalData.push(rawData);
    }
    res.json({
      code: "success",
      data: finalData,
      totalPage: pagination.totalPage
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const trashRestore = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const check = await Product.findOne({
      _id: id,
      deleted: true
    });

    if(!check) {
      return res.status(404).json({
        code: "error",
        message: "Product is not found!"
      });
    };

    await Product.updateOne({
      _id: id,
    }, {
      deleted: false,
      updatedBy: req.admin.id
    })

    res.json({
      code: "success",
      message: "Product has been restored!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}