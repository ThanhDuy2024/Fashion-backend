import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const branchValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(120).required()
      .messages({
        "any.required": "Name is required!",
        "string.empty": "Name is blank!",
        "string.min": "Name must be at least 5 character long!",
        "string.max": "Name is limited to 50 characters only"
      }),
    status: Joi.string().required()
      .messages({
        "any.required": "The status is required!",
        "string.empty": "The status is blank!",
      }),
    image: Joi.string().allow(''),
    phone: Joi.string().required()
      .messages({
        "string.empty": "Phone is blank!",
        "any.required": "Phone is required",
      }),
    address: Joi.string().required()
      .messages({
        "string.empty": "Address is blank!",
        "any.required": "Address is required",
      }),
  });

  const { error } = schema.validate(req.body);
  if(error) {
    return res.status(400).json({
      code: "error",
      message: error.details[0].message,
    })
  };
  next()
}