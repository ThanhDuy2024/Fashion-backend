import { Response } from "express"
import { admin } from "../../interface/admin.interface"
import { Categories } from "../../models/categories.model";
import moment from "moment";
import categoryTree from "../../helpers/category.helper";
import { AccountAdmin } from "../../models/accountAdmin.model";
import slugify from "slugify";
import { pagination } from "../../helpers/pagination.helper";
import { rolePermission } from "../../enums/permission";
import { softDelete } from "../../enums/softDeleteString";
import { Product } from "../../models/product.model";
export const categoryCreate = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.create)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
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
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.list)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  const find: any = {
    deleted: false
  }
  const { search, status, startDate, endDate, page } = req.query;

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

  //days filter
  if (startDate && endDate) {
    const startDateFormat = moment(String(startDate)).startOf("date").toDate();
    const endDateFormat = moment(String(endDate)).endOf('date').toDate();
    const date: any = {
      $gte: startDateFormat,
      $lte: endDateFormat,
    }
    find.createdAt = date;
  }
  //end days filter

  //pagination 
  let pageNumber: any = 1;
  if (page) {
    pageNumber = page;
  }
  const countDocuments = await Categories.countDocuments(find);

  const paginationHelper = pagination(countDocuments, parseInt(pageNumber))
  //end pagination

  const record = await Categories.find(find).limit(paginationHelper.limit).skip(paginationHelper.skip)
    .sort({
      position: "desc"
    });

  const data: any = []

  for (const item of record) {
    const rawData: any = {
      id: item.id,
      name: item.name,
      image: item.image ? item.image : "",
      status: item.status,
      createdAtFormat: "",
      updatedAtFormat: "",
      createdBy: "",
      updatedBy: ""
    };

    if (item.createdBy) {
      const account = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false,
      });

      if (account) {
        rawData.createdBy = account.fullName;
      }
    }

    if (item.updatedBy) {
      const account = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false,
      });

      if (account) {
        rawData.updatedBy = account.fullName;
      }
    };
    
    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");

    data.push(rawData);
  }

  //const dataFinal = categoryTree(data);

  res.json({
    code: "success",
    data: data,
    totalPage: paginationHelper.totalPage
  })
}

export const categoriesTree = async (req: admin, res: Response) => {

  const find: any = {
    deleted: false
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
        deleted: false
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

export const categoryDetail = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.detail)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  try {
    const id = req.params.id;
    const category = await Categories.findOne({
      _id: id,
      deleted: false,
    });

    if (!category) {
      res.status(404).json({
        code: "error",
        message: "The category is not found!"
      });
      return;
    }
    const dataFinal: any = {
      id: category.id,
      name: category.name,
      parentCategoryId: [],
      image: category.image || "",
      position: category.position,
      status: category.status,
      createdAtFormat: "",
      updatedAtFormat: "",
      createdByFormat: "",
      updatedByFormat: "",
    }

    for (const item of category.parentCategoryId) {
      if (!item.includes(softDelete.softDelete)) {
        const check = await Categories.findOne({
          _id: item,
          deleted: false
        });
        if (check) {
          dataFinal.parentCategoryId.push(item);
        }
      }
    };

    dataFinal.createdAtFormat = moment(category.createdAt).format("HH:mm DD/MM/YYYY");
    dataFinal.updatedAtFormat = moment(category.updatedAt).format("HH:mm DD/MM/YYYY");

    const createdByName = await AccountAdmin.findOne({
      _id: category.createdBy,
      deleted: false,
    })

    if (createdByName) {
      dataFinal.createdByFormat = createdByName.fullName;
    }

    const updateByName = await AccountAdmin.findOne({
      _id: category.updatedBy,
      deleted: false,
    })

    if (updateByName) {
      dataFinal.updatedByFormat = updateByName.fullName;
    }

    res.json({
      code: "success",
      data: dataFinal
    })
  } catch (error) {
    console.log(error);
    res.status(404).json({
      code: "error",
      message: "categoryId invalid!"
    })
  }
}

export const categoryEdit = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.edit)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  try {
    const id = req.params.id;

    const category = await Categories.findOne({
      _id: id,
      deleted: false,
    });

    if (!category) {
      res.status(404).json({
        code: "error",
        message: "The category has not been existed!"
      });
      return;
    }

    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    if (req.body.position) {
      req.body.position = parseInt(req.body.position);
    } else {
      req.body.position = await Categories.countDocuments() + 1;
    }

    if (req.body.parentCategoryId.length === 0) {
      req.body.parentCategoryId = [];
    } else {
      req.body.parentCategoryId = JSON.parse(req.body.parentCategoryId);
      req.body.parentCategoryId = new Set(req.body.parentCategoryId);
      req.body.parentCategoryId = Array.from(req.body.parentCategoryId);

      for (const item of req.body.parentCategoryId) {
        const check = await Categories.findOne({
          _id: item,
          deleted: false
        })

        if (!check) {
          res.status(404).json({
            code: "error",
            message: "Some categoryId not existed!"
          });
          return;
        }
      }
    }
    req.body.updatedBy = req.admin.id;

    await Categories.updateOne({
      _id: category.id,
      deleted: false
    }, req.body);

    res.json({
      code: "success",
      message: "The category has been edited!"
    });
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "The category id invalid!"
    })
  }
}

export const categoryDelete = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.delete)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  try {
    const id = req.params.id;
    const check = await Categories.findOne({
      _id: id,
      deleted: false
    });

    if (!check) {
      res.status(404).json({
        code: "error",
        message: "The category has not been existed!"
      })
      return;
    }

    const categoryParents = await Categories.find({
      parentCategoryId: check.id,
    });

    for (const item of categoryParents) {
      const checkCategoryArray: string[] = [];
      for (const jitem of item.parentCategoryId) {
        if (jitem === check.id) {
          checkCategoryArray.push(jitem + softDelete.softDelete);
        } else {
          checkCategoryArray.push(jitem);
        }
      }
      await Categories.updateOne({
        _id: item.id
      }, {
        parentCategoryId: checkCategoryArray
      });
    }

    await Categories.updateOne({
      _id: id,
      deleted: false
    }, {
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: req.admin.id
    })

    res.json({
      code: "success",
      message: "The category has been deleted!"
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "CategoryId invalid!"
    })
  }
}

export const categoryTrashList = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.trashList)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  const find: any = {
    deleted: true
  }
  const { search, startDate, endDate, page } = req.query;

  //search
  if (search) {
    const keyword = slugify(String(search), {
      lower: true
    });
    const regex = new RegExp(keyword);
    find.slug = regex;
  }
  //end search

  //days filter
  if (startDate && endDate) {
    const startDateFormat = moment(String(startDate)).startOf("date").toDate();
    const endDateFormat = moment(String(endDate)).endOf('date').toDate();
    const date: any = {
      $gte: startDateFormat,
      $lte: endDateFormat,
    }
    find.deletedAt = date;
  }
  //end days filter

  //pagination 
  let pageNumber: any = 1;
  if (page) {
    pageNumber = page;
  }
  const countDocuments = await Categories.countDocuments(find);

  const paginationHelper = pagination(countDocuments, parseInt(pageNumber))
  //end pagination

  const record = await Categories.find(find).limit(paginationHelper.limit).skip(paginationHelper.skip)
    .sort({
      deletedAt: "desc"
    });

  const data: any = []

  for (const item of record) {
    const rawData: any = {
      id: item.id,
      name: item.name,
      image: item.image ? item.image : "",
      status: item.status,
      deletedAtFormat: "",
      deletedByFormat: ""
    }

    rawData.deletedAtFormat = moment(item.deletedAt).format("HH:mm DD/MM/YYYY");

    const check = await AccountAdmin.findOne({
      _id: item.deletedBy,
      deleted: false
    })

    if (check) {
      rawData.deletedByFormat = check.fullName;
    }

    data.push(rawData);
  }

  //const dataFinal = categoryTree(data);

  res.json({
    code: "success",
    data: data,
    totalPage: paginationHelper.totalPage
  })
}

export const categoriesTrashRestore = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.trashRestore)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  try {
    const id = req.params.id;
    const check = await Categories.findOne({
      _id: id,
      deleted: true
    });

    if (!check) {
      res.status(404).json({
        code: "error",
        message: "The category has not been existed!"
      });
      return;
    }

    const category = await Categories.find({
      parentCategoryId: check.id + softDelete.softDelete
    });

    for (const item of category) {
      const checkCategoryArray: string[] = item.parentCategoryId.map(category => category === check.id + softDelete.softDelete ? check.id : category);

      await Categories.updateOne({
        _id: item.id,
      }, {
        parentCategoryId: checkCategoryArray
      });
    }

    await Categories.updateOne({
      _id: id,
      deleted: true
    }, {
      deleted: false,
      updatedBy: req.admin.id,
    })
    res.json({
      code: "success",
      message: "The category has been restored!"
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Invalid categoryId!"
    })
  }
}

export const categoriesTrashDelete = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.trashDelete)) {
    return res.status(401).json({
      code: "error",
      message: "Account is not permitted in this feature!"
    });
  }
  try {
    const id = req.params.id;

    const check = await Categories.findOne({
      _id: id,
      deleted: true
    });

    if (!check) {
      res.status(404).json({
        code: "error",
        message: "The category has not been existed!"
      })
      return;
    }

    const category = await Categories.find({
      parentCategoryId: id
    });

    if (category) {
      for (const item of category) {
        const newParentId = item.parentCategoryId.filter(parentId => parentId !== id);
        await Categories.updateOne({
          _id: item.id
        }, {
          parentCategoryId: newParentId,
          updatedBy: req.admin.id
        })
      }
    }

    const product = await Product.find({
      categoryIds: id
    });

    if (product) {
      for (const item of product) {
        const checkCategoryArray = item.categoryIds.filter(category => category !== id);
        await Product.updateOne({
          _id: item.id,
        }, {
          categoryIds: checkCategoryArray,
          updatedBy: req.admin.id,
        });
      }
    }

    await Categories.deleteOne({
      _id: check.id,
      deleted: true
    })

    res.json({
      code: "success",
      message: "The category has been deleted!"
    });
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "Invalid categoryId"
    })
  }
}