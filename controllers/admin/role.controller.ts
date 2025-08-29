import { raw, Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Role } from "../../models/role.model";
import { rolePermission } from "../../enums/permission";
import moment from "moment";
import { AccountAdmin } from "../../models/accountAdmin.model";
import * as paginationFeature from "../../helpers/pagination.helper";
import slugify from "slugify";

export const roleCreate = async (req: admin, res: Response) => {
  const { name, permission } = req.body;

  const check = await Role.findOne({
    name: name,
  })

  if(check) {
    res.status(400).json({
      code: "error",
      message: "Role name has been existed!"
    });
    return;
  }

  const permissionArray = Object.values(rolePermission);

  let ok;
  permission.forEach((item:any) => {
    const permissionCheck = permissionArray.includes(item);
    if(!permissionCheck) {
      ok = false
    }
  });

  if(ok === false) {
    res.status(400).json({
      code: "error"
    });
    return;
  }

  req.body.createdBy = req.admin.id;
  req.body.updatedBy = req.admin.id;

  const newRole = new Role(req.body);

  await newRole.save();

  res.json({
    code: "success",
    message: "Role has been completed!"
  })
}

export const roleList = async (req: admin, res: Response) => {
  const find:any = {
    deleted: false
  }

  const { search, status, page } = req.query;
  //search
  if(search) {
    const keyword = slugify(String(search), {
      lower: true
    });
    const regex = new RegExp(keyword);
    find.slug = regex;
  }
  //end search

  //status
  if(status) {
    find.status = status;
  }
  //end status

  //pagination
  let pageNumber:Number = 1;
  if(page) {
    pageNumber = parseInt(String(page));
  }
  const countDocuments = await Role.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, parseInt(String(pageNumber)));
  //end pagination
  const role = await Role.find(find).limit(pagination.limit).skip(pagination.skip)
    .sort({
      createdAt: "desc"
    });
  
  const finalData:any = []

  for (const item of role) {
    const rawData:any = {
      id: item.id,
      name: item.name,
      permission: item.permission,
      status: item.status,
      createdByFormat: "",
      updatedByFormat: ""
    }

    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");

    if(item.createdBy) {
      const account = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      })

      if(account) {
        rawData.createdByFormat = account.fullName;
      }
    }

    if(item.updatedBy) {
      const account = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      })

      if(account) {
        rawData.updatedByFormat = account.fullName;
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

export const roleDetail = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const role = await Role.findOne({
      _id: id,
      deleted: false
    });

    if(!role) {
      return res.status(404).json({
        code: "error",
        message: "The item is not found!"
      });
    }

    const finalData:any = {
      id: role.id,
      name: role.name,
      permission: role.permission,
      createdByFormat: "",
      updatedByFormat: "",
    }

    finalData.createdAtFormat = moment(role.createdAt).format("HH:mm DD/MM/YYYY");
    finalData.updatedAtFormat = moment(role.updatedAt).format("HH:mm DD/MM/YYYY");

    if(role.createdBy) {
      const account = await AccountAdmin.findOne({
        _id: role.createdBy,
        deleted: false
      });

      if(account) {
        finalData.createdByFormat = account.fullName;
      }
    }

    if(role.updatedBy) {
      const account = await AccountAdmin.findOne({
        _id: role.updatedBy,
        deleted: false
      });

      if(account) {
        finalData.updatedByFormat = account.fullName;
      }
    }
    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: "The item is not found!"
    })
  }
}

export const roleEdit = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const { permission } = req.body;

    const role = await Role.findOne({
      _id: id,
      deleted: false
    });

    if(!role) {
      return res.json({
        code: "error",
        message: "The role is not found!"
      });
    }

    const permissionArray = Object.values(rolePermission);

    for (const item of permission) {
      const check = permissionArray.includes(item);

      if(!check) {
        res.status(404).json({
          code: "error",
          message: `The ${item} is not found in data!`
        });
        return;
      }
    }

    req.body.updatedBy = req.admin.id;

    await Role.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    res.json({
      code: "success",
      message: "The role has been edited!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "The role is not found!"
    })
  }
}

export const roleDelete = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const check = await Role.findOne({
      _id: id,
      deleted: false
    })

    if(!check) {
      return res.status(404).json({
        code: "error",
        message: `The role is not found!`
      })
    }

    const account = await AccountAdmin.find({
      roleId: id,
    })

    for (const item of account) {
      await AccountAdmin.updateOne({
        _id: item.id
      }, {
        roleId: id + " softDelete"
      })
    }


    await Role.updateOne({
      _id: id,
      deleted: false
    }, {
      deleted: true,
      deletedBy: req.admin.id,
      deletedAt: Date.now(),
    })
    
    res.json({
      code: "success",
      message: "The role has been deleted!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: "The role is not found!"
    })
  }
}

export const roleTrashList = async (req: admin, res: Response) => {
  const find:any = {
    deleted: true
  }

  const { search, page } = req.query;

  //search
  if(search) {
    const keyword = slugify(String(search), {
      lower: true,
    })
    const regex = new RegExp(keyword);
    
    find.slug = regex;
  }
  //end search

  //pagination
  let pageNumber:number = 1;
  if(page) {
    pageNumber = parseInt(String(page));
  }

  const countDocuments = await Role.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);
  //pagination

  const finalData:any = [];
  const role = await Role.find(find).sort({
    deletedAt: "desc"
  }).limit(pagination.limit).skip(pagination.skip);

  for (const item of role) {
    const rawData:any = {
      id: item.id,
      name: item.name,
      deletedByFormat: "",
    }

    if(item.deletedBy) {
      const account = await AccountAdmin.findOne({
        _id: item.deletedBy,
        deleted: false
      })
      if(account) {
        rawData.deletedByFormat = account.fullName;
      }

      rawData.deletedAtFormat = moment(item.deletedAt).format("HH:mm DD/MM/YYYY");
    }

    finalData.push(rawData);
  }
  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage
  })
}

export const roleaTrashRestore = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Role.findOne({
      _id: id,
      deleted: true
    })

    if(!check) {
      res.status(404).json({
        code: "error",
        message: "The role is not found!"
      })
      return;
    }

    const account = await AccountAdmin.find({
      roleId: id + " softDelete",
    });

    console.log(account);

    for (const item of account) {
      await AccountAdmin.updateOne({
        _id: item.id
      }, {
        roleId: id,
      })
    }

    await Role.updateOne({
      _id: id,
      deleted: true
    }, {
      deleted: false,
      updatedBy: req.admin.id
    })
    res.json({
      code: "success",
      message: "The role has been restored!"
    })
  
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "The role is not found!"
    })
  }
}
