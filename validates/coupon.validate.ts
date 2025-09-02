import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export const couponValidate = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        "string.empty": "Coupon name is blank!",
        "string.min": "Coupon name has minimum 3 characters!",
        "string.max": "Coupon name has maximum 50 characters!",
        "any.required": "Coupon name is required!"
      }),
    discount: Joi.string().required()
      .messages({
        "any.required": "Coupon discount is required!",
        "string.empty": "Coupon discount is blank!"
      }),
    startDay: Joi.date().required()
      .messages({
        "any.required": "start day is required!",
        "date.empty": "start day is blank!",
      }),
    endDay: Joi.date().greater(Joi.ref("startDay")).required()
      .messages({
        "any.required": "End day is required!",
        "date.empty": "End day is blank!",
        "date.greater": "End day is not greater than start day!"
      }),
    status: Joi.string().required()
      .messages({
        "string.empty": "Coupon status is blank!",
        "any.required": "Coupon status is required!"
      })
  })

  const { error } = schema.validate(req.body);

  if(error) {
    return res.status(400).json({
      code: "error",
      message: error.details[0].message
    })
  }
  next();
}