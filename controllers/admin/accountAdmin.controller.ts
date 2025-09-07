import { Request, Response } from "express";
import { AccountAdmin } from "../../models/accountAdmin.model";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { admin } from "../../interface/admin.interface";
import { Role } from "../../models/role.model";
import moment from "moment";
import slugify from "slugify";
import * as paginationFeature from "../../helpers/pagination.helper";

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

  const accessToken = jwt.sign({
    fullName: check.fullName,
    email: check.email
  }, String(process.env.JWT_ACCESS_TOKEN), {
    expiresIn: "5h"
  });

  const refreshToken = jwt.sign({
    fullName: check.fullName,
    email: check.email
  }, String(process.env.JWT_REFRESH_TOKEN), {
    expiresIn: "30d"
  })

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    secure: false,
    sameSite: "lax"
  })
  res.json({
    code: "success",
    message: "Login has been completed!",
    accessToken: accessToken,
  })
}

export const profile = async (req: admin, res: Response) => {
  const finalData = {
    fullName: req.admin.fullName,
    email: req.admin.email,
    image: req.admin.image ? req.admin.image : "",
    phone: req.admin.phone ? req.admin.phone : "",
    address: req.admin.address ? req.admin.address : "",
    roleName: req.admin.roleName,
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
    if (status !== "active" && status !== "inactive") {
      res.status(400).json({
        code: "error",
        message: "your status is incorrect!"
      });
      return;
    }

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

export const create = async (req: admin, res: Response) => {
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
  const find: any = {
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