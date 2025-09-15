import { Response } from "express";
import { admin } from "../../interface/admin.interface";
import { AccountClient } from "../../models/accountClient.model";
import moment from "moment";
import { pagination } from "../../helpers/pagination.helper";
import { AccountAdmin } from "../../models/accountAdmin.model";

export const getAllAccountClient = async (req: admin, res: Response) => {
  try {
    const find: any = {
      deleted: false,
    }

    const { search_email, status, page } = req.query;

    if (search_email) {
      const regex = new RegExp(String(search_email));
      find.email = regex;
    };

    if (status === "active" || status === "inactive") {
      find.status = status;
    }

    let pageNumber: number = 1;

    if (page) {
      pageNumber = parseInt(String(page));
    };
    const countDocuments = await AccountClient.countDocuments(find);
    const paginationFeature = pagination(countDocuments, pageNumber);

    const account = await AccountClient.find(find).limit(paginationFeature.limit).skip(paginationFeature.skip);

    const finalData: any = [];

    for (const item of account) {
      const rawData: any = {
        id: item.id,
        fullName: item.fullName,
        email: item.email,
        image: item.image,
        status: item.status,
        updatedBy: "",
      }

      rawData.createdAt = moment(item.createdAt).format("HH:mm DD/MM/YYYY");

      if (item.updatedBy) {
        const account = await AccountAdmin.findOne({
          _id: item.updatedBy,
          deleted: false,
        });

        if (account) {
          rawData.updatedBy = account.fullName;
        }
      }
      finalData.push(rawData);
    };

    res.json({
      code: "success",
      data: finalData,
      totalPage: paginationFeature.totalPage
    })
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const updateAccountClient = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.query;

    const account = await AccountClient.findOne({
      _id: id,
      deleted: false
    });

    if (!account) {
      return res.json({
        code: "error",
        message: "Account user is not found!"
      });
    };
    
    switch (status) {
      case "active":
        await AccountClient.updateOne({
          _id: account.id,
          deleted: false,
        }, {
          status: "inactive"
        });
        break;
      case "inactive":
        await AccountClient.updateOne({
          _id: account.id,
          deleted: false,
        }, {
          status: "active"
        });
        break;
      default:
        return res.json({
          code: "error",
          message: "status only active or inactive"
        })
    }

    res.json({
      code: "success",
      message: "Account user has been updated!"
    })
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}

export const deleteAccountClient = async (req: admin, res: Response) => {
  try {
    const { id } = req.params;

    const item = await AccountClient.findOne({
      _id: id,
      deleted: false
    });

    if(!item) {
      return res.status(404).json({
        code: "error",
        message: "Account is not found!"
      })
    };

    await AccountClient.updateOne({
      _id: id
    }, {
      deleted: true,
      deletedBy: req.admin.id,
      deletedAt: Date.now()
    });

    res.json({
      code: "success",
      message: "Account has been deleted!"
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      code: "error",
      message: error
    })
  }
}