import { Request, Response } from "express";
import { AccountAdmin } from "../../models/accountAdmin.model";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { admin } from "../../interface/admin.interface";
import { Role } from "../../models/role.model";
import moment from "moment";
import slugify from "slugify";
import * as paginationFeature from "../../helpers/pagination.helper";
import { rolePermission } from "../../enums/permission";
import client from "../../tests/redisTest";
export const register = async (req: Request, res: Response) => {
  const check = await AccountAdmin.findOne({
    email: req.body.email,
  });

  if (check) {
    res.status(400).json({
      code: "error",
      message: "Your email has been registered!"
    });
    return;
  };

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(String(req.body.password), salt);

  req.body.password = hash;

  const newAccount = new AccountAdmin(req.body);
  await newAccount.save();

  res.json({
    code: "success",
    message: "Your account has been registered!"
  })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const check = await AccountAdmin.findOne({
    email: email,
    deleted: false,
    status: "active"
  });

  if (!check) {
    res.status(404).json({
      code: "error",
      message: "your email has not been registered!"
    });
    return;
  }

  const hash = bcrypt.compareSync(String(password), String(check.password));

  if (!hash) {
    res.status(404).json({
      code: "error",
      message: "Your password incorrect!"
    });
    return;
  }

  const token = await client.get(email);

  if(token) {
    await client.del(email);
  }

  const refreshToken = jwt.sign({
    fullName: check.fullName,
    email: check.email
  }, String(process.env.JWT_REFRESH_TOKEN), {
    expiresIn: "30d"
  });

  await client.set(email, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: "lax"
  })
  res.json({
    code: "success",
    message: "Login has been completed!",
  })
}

export const profile = async (req: admin, res: Response) => {
  const finalData = {
    fullName: req.admin.fullName,
    email: req.admin.email,
    image: req.admin.image ? req.admin.image : "",
    phone: req.admin.phone ? req.admin.phone : "",
    address: req.admin.address ? req.admin.address : "",
    role: req.admin.role,
    permission: req.admin.permission,
    status: req.admin.status,
  }

  res.json({
    code: "success",
    data: finalData
  })
}

export const profileEdit = async (req: admin, res: Response) => {
  try {
    const { email, status } = req.body;

    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    const check = await AccountAdmin.findOne({
      _id: { $ne: req.admin.id },
      email: email
    })

    if (check) {
      return res.status(400).json({
        code: "error",
        message: "Your new email are existed!"
      });
    }

    req.body.updatedBy = req.admin.id;

    await AccountAdmin.updateOne({
      _id: req.admin.id,
    }, req.body);

    res.json({
      code: "success",
      message: "your profile have been edited!"
    })
  } catch (error) {
    res.json({
      code: "error",
    })
  }
}

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(404).json({
        code: "error",
        message: "Your token is expired!"
      });
      return;
    }

    const verify = jwt.verify(String(refreshToken), String(process.env.JWT_REFRESH_TOKEN)) as JwtPayload;

    const check = await AccountAdmin.findOne({
      email: verify.email,
      deleted: false,
      status: "active"
    });

    if (!check) {
      res.clearCookie("refreshToken", refreshToken);
      res.status(404).json({
        code: "error",
        message: "Verify refresh token error!"
      });
      return;
    }

    const accessToken = jwt.sign({
      fullName: check.fullName,
      email: check.email,
    }, String(process.env.JWT_ACCESS_TOKEN), {
      expiresIn: "1h"
    })

    res.json({
      code: "success",
      message: "Refresh token has been completed!",
      accessToken: accessToken
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: "Refresh token expire in!"
    });
  }
}

export const forgotPassword = async (req: admin, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const account = await AccountAdmin.findOne({
      _id: req.admin.id,
    });

    const checkCurrentPassword = bcrypt.compareSync(currentPassword, String(account?.password));

    if(!checkCurrentPassword) {
      return res.status(400).json({
        code: "error",
        message: "Your current password is incorrected!"
      })
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(String(newPassword), salt);

    await AccountAdmin.updateOne({
      _id: req.admin.id,
      deleted: false
    }, {
      password: hash
    });

    res.clearCookie("refreshToken").json({
      code: "success",
      message: "Your account password has been changed!"
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}

export const logout = async (req: admin, res: Response) => {
  res.clearCookie("refreshToken");
  res.json({
    code: "success",
    message: "Account has been logout!"
  });
}

export const create = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminCreate)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }

  try {

    const { email, password, roleId } = req.body;

    const checkEmail = await AccountAdmin.findOne({
      email: email,
    });

    if (checkEmail) {
      return res.status(400).json({
        code: "success",
        message: "Email has been existed!"
      });
    }

    const checkRoleId = await Role.findOne({
      _id: roleId,
      deleted: false
    });

    if (!checkRoleId) {
      return res.status(404).json({
        code: "error",
        message: "Role is not found!",
      });
    }


    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(String(password), salt);

    req.body.password = hash;

    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    req.body.createdBy = req.admin.id;
    req.body.updatedBy = req.admin.id;

    await AccountAdmin.create(req.body);

    res.json({
      code: "success",
      message: "Accout has been created!"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "success",
      message: error,
    })
  }
}

export const list = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminList)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }

  const find: any = {
    _id: { $ne: req.admin.id },
    deleted: false
  };

  const { search, status, page } = req.query;

  //search
  if (search) {
    const keyword = slugify(String(search), {
      lower: true,
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
  const countDocuments = await AccountAdmin.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);

  //end pagination

  const account = await AccountAdmin.find(find).sort({
    createdAt: "desc",
  }).limit(pagination.limit).skip(pagination.skip);

  const finalData: any = [];

  for (const item of account) {
    const rawData: any = {
      id: item.id,
      name: item.fullName,
      image: item.image,
      status: item.status,
      createdBy: "",
      updatedBy: "",
    }

    if (item.createdBy) {
      const check = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      });

      if (check) {
        rawData.createdBy = check.fullName;
      }
    }

    if (item.updatedBy) {
      const check = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      });

      if (check) {
        rawData.updatedBy = check.fullName;
      }
    }

    rawData.createdAtFormat = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    rawData.updatedAtFormat = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");
    finalData.push(rawData);
  }

  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage
  });
}

export const deltail = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminDetail)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }

  try {
    const { id } = req.params;

    const account = await AccountAdmin.findOne({
      _id: id,
      deleted: false
    });

    if (!account) {
      return res.status(404).json({
        code: "error",
        message: "Account is not found!"
      });
    }

    const finalData: any = {
      id: account.id,
      name: account.fullName,
      image: account.image,
      email: account.email,
      address: account.address,
      phone: account.phone,
      roleId: "",
      status: account.status,
      createdBy: "",
      updatedBy: "",
    };

    finalData.createdAtFormat = moment(account.createdAt).format("HH:mm DD/MM/YYYY");
    finalData.updatedAtFormat = moment(account.updatedAt).format("HH:mm DD/MM/YYYY");

    if (account.createdBy) {
      const check = await AccountAdmin.findOne({
        _id: account.createdBy,
        deleted: false
      });

      if (check) {
        finalData.createdBy = check.fullName;
      }
    }

    if (account.updatedBy) {
      const check = await AccountAdmin.findOne({
        _id: account.updatedBy,
        deleted: false
      });

      if (check) {
        finalData.updatedBy = check.fullName;
      }
    }

    if (account.roleId) {
      const checkRoleId = await Role.findOne({
        _id: account.roleId,
        deleted: false
      });

      if(checkRoleId) {
        finalData.roleId = checkRoleId.id;
      }
    }

    res.json({
      code: "error",
      data: finalData
    })
  } catch (error) {
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}

export const edit = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminEdit)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }

  try {
    const { id } = req.params;

    const account = await AccountAdmin.findOne({
      _id: id,
      deleted: false,
    });

    if(!account) {
      return res.status(404).json({
        code: "error",
        message: "Account is not found!",
      });
    };

    const { email } = req.body
    const checkEmail = await AccountAdmin.findOne({
      _id: { $ne: id },
      email: email,
    });

    if(checkEmail) {
      return res.status(404).json({
        code: "success",
        message: "Email has been existed!"
      });
    }

    if(req.file){
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    const checkRoleId = await Role.findOne({
      _id: req.body.roleId,
      deleted: false
    });

    if(!checkRoleId) {
      return res.status(404).json({
        code: "error",
        message: "Role is not found!"
      });
    }

    if(req.body.status !== "active" && req.body.status !== "inactive") {
      return res.status(400).json({
        code: "error",
        message: "Status has only active or inactive!"
      });
    }

    req.body.updatedBy = req.admin.id;

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, req.body);

    res.json({
      code: "success",
      message: "Account has been edited!"
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({
      code: "error",
      message: error,
    })
  }
}

export const deleted = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminDelete)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }

  try {
    const { id } = req.params;

    const check = await AccountAdmin.findOne({
      _id: id,
      deleted: false
    });

    if (!check) {
      return res.status(404).json({
        code: "error",
        message: "Account is not found!"
      });
    };

    await AccountAdmin.updateOne({
      _id: id,
      deleted: false
    }, {
      deleted: true,
      deletedAt: Date.now(),
      deletedBy: req.admin.id
    })

    res.json({
      code: "success",
      message: "Account has been deleted!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const trashList = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminTrashList)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }

  const find: any = {
    _id: { $ne: req.admin.id },
    deleted: true
  };

  const { search, status, page } = req.query;

  //search
  if (search) {
    const keyword = slugify(String(search), {
      lower: true,
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
  const countDocuments = await AccountAdmin.countDocuments(find);
  const pagination = paginationFeature.pagination(countDocuments, pageNumber);

  //end pagination

  const account = await AccountAdmin.find(find).sort({
    createdAt: "desc",
  }).limit(pagination.limit).skip(pagination.skip);

  const finalData: any = [];

  for (const item of account) {
    const rawData: any = {
      id: item.id,
      name: item.fullName,
      image: item.image,
      status: item.status,
      deletedBy: ""
    }

    if (item.deletedBy) {
      const check = await AccountAdmin.findOne({
        _id: item.deletedBy,
        deleted: false
      });

      if (check) {
        rawData.deletedBy = check.fullName;
      }
    }

    rawData.deletedAtFormat = moment(item.deletedAt).format("HH:mm DD/MM/YYYY");
    finalData.push(rawData);
  }

  res.json({
    code: "success",
    data: finalData,
    totalPage: pagination.totalPage
  });
}

export const trashRestore = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminTrashRestore)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }
  try {
    const { id } = req.params;

    const check = await AccountAdmin.findOne({
      _id: id,
      deleted: true
    });

    if (!check) {
      return res.status(404).json({
        code: "error",
        message: "Product is not found!"
      });
    };

    await AccountAdmin.updateOne({
      _id: id,
    }, {
      deleted: false,
      updatedBy: req.admin.id
    })

    res.json({
      code: "success",
      message: "Account has been restored!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const trashDelete = async (req: admin, res: Response) => {
  const { permission } = req.admin;
  if (!permission.includes(rolePermission.accountAdminTrashDelete)) {
    return res.status(400).json({
      code: "success",
      message: "Account has not permitted in feature!"
    })
  }
  try {
    const { id } = req.params;

    const check = await AccountAdmin.findOne({
      _id: id,
      deleted: true
    });

    if (!check) {
      return res.status(404).json({
        code: "error",
        message: "Account is not found!"
      });
    };

    await AccountAdmin.deleteOne({
      _id: id,
      deleted: true
    });

    res.json({
      code: "success",
      message: "Account has been deleted!"
    })
  } catch (error) {
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}