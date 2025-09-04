import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const productValidate = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required()
      .messages({
        "string.required": "Product name is required!",
        "string.empty": "Product name is blank!",
        "string.min": "Product name has minimum 5 characters!",
        "string.max": "Product name has maximum 5 characters!",
      }),
    categoryIds: Joi.allow(''),
    image: Joi.allow(''),
    sex: Joi.allow(''),
    styleId: Joi.allow(''),
    season: Joi.allow(''),
    size: Joi.string().required()
      .messages({
        "string.required": "Size is required!",
        "string.empty": "Size is blank!"
      }),
    material: Joi.string(),
    quantity: Joi.string().required()
      .messages ({
        "string.required": "Quantity is required!",
        "string.empty": "Quantity is blank!"        
      }),
    originPrice: Joi.string().required()
      .messages ({
        "string.required": "Origin price is required!",
        "string.empty": "Origin price is blank!"        
      }),
    currentPrice: Joi.string().required()
      .messages ({
        "string.required": "Current price is required!",
        "string.empty": "Current price is blank!"        
      }),
    orginOfProduction: Joi.allow('')
  })

  const { error } = schema.validate(req.body);

  if(error) {
    return res.status(400).json({
      code: "error",
      message: error.details[0].message,
    })
  }
  next();
}