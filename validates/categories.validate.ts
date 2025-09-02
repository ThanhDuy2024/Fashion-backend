import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const categoriesValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "The category name is required!",
        "string.empty": "The category name is blank!",
        "string.min": "The category must be at least 5 character long!",
        "string.max": "The category is limited to 50 characters only"
      }),
    status: Joi.string().required()
      .messages({
        "any.required": "The status is required!",
        "string.empty": "The status is blank!",
      }),
    image: Joi.string().allow(''),
    parentCategoryId: Joi.string().allow(''),
    position: Joi.string().allow('')
  });

  const { error } = schema.validate(req.body);

  if(error) {
    res.status(400).json({
      code: "error",
      message: error.details[0].message
    });
    return;
  }

  next();
}