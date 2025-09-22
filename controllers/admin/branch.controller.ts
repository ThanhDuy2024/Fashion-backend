import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { Branch } from "../../models/branch.model";
import { AccountAdmin } from "../../models/accountAdmin.model";
import moment from "moment";
import slugify from "slugify";
import { pagination } from "../../helpers/pagination.helper";

const skip = 0;
const limit = 10
export const createBranch = async (req: admin, res: Response) => {
  try {
    if (req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    };

    req.body.createdBy = req.admin.id;
    req.body.updatedBy = req.admin.id;
    await Branch.create(req.body);

    res.json({
      code: "success",
      message: "Branch has been created!"
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
};

export const getAllBranch = async (req: admin, res: Response) => {
  try {
    const find: any = {};

    const { search, page } = req.query;

    const keyword: string = "";
    if (search !== keyword) {
      const slug = slugify(String(search), {
        lower: true
      });
      const regex = new RegExp(slug);
      find.slug = regex;
    };

    let pageNumber: number = 1;
    if (page) {
      pageNumber = parseInt(String(page));
    };
    const countDocuments = await Branch.countDocuments(find);
    const paginationFeature = pagination(countDocuments, pageNumber, skip, limit);
    const branch = await Branch.find(find).sort({
      createdAt: "desc"
    }).skip(paginationFeature.skip).limit(paginationFeature.limit);

    const finalData: any = [];

    for (const item of branch) {
      const rawData: any = {
        id: item.id,
        name: item.name,
        image: item.image,
        status: item.status,
        createdBy: "",
        updatedBy: ""
      };

      if (item.createdBy) {
        const account = await AccountAdmin.findOne({
          _id: item.createdBy,
          deleted: false
        });

        if (account) {
          rawData.createdBy = account.fullName;
        }
      }

      if (item.updatedBy) {
        const account = await AccountAdmin.findOne({
          _id: item.updatedBy,
          deleted: false
        });

        if (account) {
          rawData.updatedBy = account.fullName;
        }
      }

      rawData.createdAt = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
      rawData.updatedAt = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");

      finalData.push(rawData);
    }
    res.json({
      code: "success",
      data: finalData,
      totalPage: paginationFeature.totalPage,
    })
  } catch (error) {
    console.log(error);
    res.status(404).json({
      code: "error",
      message: error
    })
  }
}

export const branchDetail = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const item = await Branch.findById(id);

    if (!item) {
      return res.status(404).json({
        code: "error",
        message: "Branch is not found!"
      });
    };

    const finalData: any = {
      id: item.id,
      name: item.name,
      image: item.image,
      status: item.status,
      createdBy: "",
      updatedBy: ""
    };

    if (item.createdBy) {
      const account = await AccountAdmin.findOne({
        _id: item.createdBy,
        deleted: false
      });

      if (account) {
        finalData.createdBy = account.fullName;
      }
    }

    if (item.updatedBy) {
      const account = await AccountAdmin.findOne({
        _id: item.updatedBy,
        deleted: false
      });

      if (account) {
        finalData.updatedBy = account.fullName;
      }
    }

    finalData.createdAt = moment(item.createdAt).format("HH:mm DD/MM/YYYY");
    finalData.updatedAt = moment(item.updatedAt).format("HH:mm DD/MM/YYYY");
    res.json({
      code: "success",
      data: finalData
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const updateBranch = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Branch.findById(id);

    if(!check) {
      return res.status(404).json({
        code: "error",
        message: "Branch is not found!"
      });
    }
    
    if(req.file) {
      req.body.image = req.file.path;
    } else {
      delete req.body.image;
    }

    req.body.updatedBy = req.admin.id;

    await Branch.updateOne({
      _id: id
    }, req.body);

    res.json({
      code: "success",
      message: "Branch has been updated!"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const deleteBranch = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const check = await Branch.findById(id);
    if(!check) {
      return res.status(404).json({
        code: "error",
        message: "Branch is not found!"
      });
    };

    await Branch.deleteOne({
      _id: id
    });
    
    res.json({
      code: "success",
      message: "Branch has been deleted!"
    })
  } catch (error) {
    console.log(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}