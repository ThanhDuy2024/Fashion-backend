import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const styleValidate = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        "any.required": "Name is required!",
        "string.empty": "Name is blank!",
        "string.min": "Name must be at least 3 character long",
        "string.max": "Name is limited to 50 characters only"
      })
  })

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

export const styleEditValidate = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        "any.required": "Name is required!",
        "string.empty": "name is blank!",
        "string.min": "Name must be at least 3 character long",
        "string.max": "Name is limited to 50 characters only"
      }),
    status: Joi.string().required()
      .messages({
        "string.empty": "status is blank!"
      })
  })

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