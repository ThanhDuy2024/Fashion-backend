import { NextFunction, Request, Response } from "express";
import Joi from "joi"
export const registerValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required()
      .messages({
        "string.empty": "Your name is blank!",
        "string.min": "Your name must be at least 5 character long!",
        "string.max": "Your name is limited to 50 characters only"
      }),
    email: Joi.string().email().required()
      .messages({
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    password: Joi.string().min(5).max(50).required()
      .messages({
        "string.empty": "Your password is blank!",
        "string.min": "Your password must be at least 5 character long!",
        "string.max": "Your password is limited to 50 character only!"
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

export const loginValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
      .messages({
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    password: Joi.string().min(5).max(50).required()
      .messages({
        "string.empty": "Your password is blank!",
        "string.min": "Your password must be at least 5 character long!",
        "string.max": "Your password is limited to 50 character only!"
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