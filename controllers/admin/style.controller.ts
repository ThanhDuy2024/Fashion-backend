import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Style } from "../../models/style.model";
import { AccountAdmin } from "../../models/accountAdmin.model";
import * as paginationFeature from "../../helpers/pagination.helper";
import moment from "moment";
import slugify from "slugify";

export const styleCreate = async (req: admin, res: Response) => {
  const { name } = req.body;

  const check = await Style.findOne({
    name: name,
    deleted: false,
  })

  if (check) {
    res.status(400).json({
      code: "success",
      message: "The style name has been existed in your store!"
    });
    return;
  }

  req.body.createdBy = req.admin.id;
  req.body.updatedBy = req.admin.id;

  const newRecord = new Style(req.body);
  await newRecord.save();

  res.json({
    code: "success",
    message: "The style has been created!"
  })
}

export const styleList = async (req: admin, res: Response) => {
  const find: any = {
    deleted: false
  }

  const { search, status, page } = req.query;
  //search 
  if(search) {
    const keyword = slugify(String(search), {
      lower:true
    });

    const regex = new RegExp(keyword);
    find.slug = regex;
  }
  //end search

  //status fillter
  if(status == "active" || status == "inactive") {
    find.status = status;
  }
  //end status fillter

  //pagination
  let pageNumber:number = 1
  if(page) {
    pageNumber = parseInt(String(page));
  }
  const countDocuments = await Style.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);
  //end pagination
  const record = await Style.find(find).sort({
    createdAt: "desc",
  }).limit(pagination.limit).skip(pagination.skip);

  const finalData = []

  for (const item of record) {
    const rawData: any = {
      id: item.id,
      name: item.name,
      status: item.status,
      createdByFormat: "",
      updatedByFormat: "",
    }

    if (item.createdBy) {
      const check = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      })

      if (check) {
        rawData.createdByFormat = check.fullName;
      }
    }

    if (item.updatedBy) {
      const check = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      })

      if (check) {
        rawData.updatedByFormat = check.fullName;
      }
    }

    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");
    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    finalData.push(rawData);
  }


  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage,
  })
}

export const styleDetail = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    
    const check = await Style.findOne({
      _id: id,
      deleted: false
    });

    if(!check) {
      res.status(404).json({
        code: "error",
        message: "The style is not found!"
      });
      return;
    }

    const finalData:any = {
      _id: check.id,
      name: check.name,
      status: check.status,
    }

    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "The style is not found!"
    })
  }
}

export const styleEdit = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    
    if(req.body.status !== "active" && req.body.status !== "inactive") {
      res.status(400).json({
        code: "error",
        message: "The style status incorrected!"
      })
      return;
    }
    
    const check = await Style.findOne({
      _id: id,
      deleted: false
    });

    if(!check) {
      res.status(404).json({
        code: "error",
        message: "The style is not found!"
      });
      return;
    }

    const checkName = await Style.findOne({
      _id: { $ne: check.id},
      name: req.body.name
    })

    if(checkName) {
      res.status(400).json({
        code: "error",
        message: "The style name has been existed in your style"
      });
      return;
    }

    req.body.updatedBy = req.admin.id;

    await Style.updateOne({
      _id: check.id,
    }, req.body);

    res.json({
      code: "success",
      message: "The style has been edited!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "The style is not found!"
    })
  }
}

export const styleDelete = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Style.findOne({
      _id: id,
      deleted: false
    });

    if(!check) {
      res.status(404).json({
        code: "error",
        message: "The style is not found!"
      });
      return;
    }

    await Style.updateOne({
      _id: id,
    }, {
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: req.admin.id
    });

    res.json({
      code: "success",
      message: "The style has been deleted!"
    });
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "The style is not found!"
    })
  }
}

export const styleTrashList = async (req: admin, res: Response) => {
  const find:any = {
    deleted: true
  }

  const { search, status, page } = req.query;
  //search 
  if(search) {
    const keyword = slugify(String(search), {
      lower:true
    });

    const regex = new RegExp(keyword);
    find.slug = regex;
  }
  //end search

  //status fillter
  if(status == "active" || status == "inactive") {
    find.status = status;
  }
  //end status fillter

  //pagination
  let pageNumber:number = 1
  if(page) {
    pageNumber = parseInt(String(page));
  }
  const countDocuments = await Style.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);
  //end pagination

  const style = await Style.find(find).sort({
    deletedAt: "desc"
  }).limit(pagination.limit).skip(pagination.skip);

  const finalData:any = [];

  for (const item of style) {
    const rawData:any = {
      id: item.id,
      name: item.name,
      deletedByFormat: "",
    }

    rawData.deletedAtFormat = moment(item.deletedAt).format("HH:mm DD/MM/YYYY");

    if(item.deletedAt) {
      const account = await AccountAdmin.findOne({
        _id: item.deletedBy,
        deleted: false
      });
      if(account) {
        rawData.deletedByFormat = account.fullName;
      }
    }
    finalData.push(rawData);
  }
  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage
  })
}

export const styleTrashRestore = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Style.findOne({
      _id: id,
      deleted: true
    })

    if(!check) {
      res.status(404).json({
        code: "error",
        message: "The style is not found!"
      })
      return;
    }

    await Style.updateOne({
      _id: id,
      deleted: true
    }, {
      deleted: false,
      updatedBy: req.admin.id
    })
    res.json({
      code: "success",
      message: "The style has been restored!"
    })
  
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "The style is not found!"
    })
  }
}