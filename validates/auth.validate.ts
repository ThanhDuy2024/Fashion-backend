import { NextFunction, Request, Response } from "express";
import Joi from "joi"
export const registerValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your name is required!",
        "string.empty": "Your name is blank!",
        "string.min": "Your name must be at least 5 character long!",
        "string.max": "Your name is limited to 50 characters only"
      }),
    email: Joi.string().email().required()
      .messages({
        "any.required": "Your email is required!",
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    password: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your password is required!",
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
        "any.required": "Your email is required!",
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    password: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your password is required!",
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

export const profileValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your name is required!",
        "string.empty": "Your name is blank!",
        "string.min": "Your name must be at least 5 character long!",
        "string.max": "Your name is limited to 50 characters only"
      }),
    email: Joi.string().email().required()
      .messages({
        "any.required": "Your email is required!",
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    address: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    image: Joi.string().allow(""),
    roleId: Joi.string().allow(""),
    status: Joi.string().required()
      .messages({
        "any.required": "Your account is required!",
        "string.empty": "your account status are blank!"
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

export const profileClientValidate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your name is required!",
        "string.empty": "Your name is blank!",
        "string.min": "Your name must be at least 5 character long!",
        "string.max": "Your name is limited to 50 characters only"
      }),
    email: Joi.string().email().required()
      .messages({
        "any.required": "Your email is required!",
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    address: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    image: Joi.allow(),
    birthDay: Joi.allow(""),
    bankCode: Joi.allow("")
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

export const accountAdminCreate = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    fullName: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your name is required!",
        "string.empty": "Your name is blank!",
        "string.min": "Your name must be at least 5 character long!",
        "string.max": "Your name is limited to 50 characters only"
      }),
    email: Joi.string().email().required()
      .messages({
        "any.required": "Your email is required!",
        "string.empty": "Your email is blank!",
        "string.email": "Your email is broken!"
      }),
    password: Joi.string().min(5).max(50).required()
      .messages({
        "any.required": "Your password is required!",
        "string.empty": "Your password is blank!",
        "string.min": "Your password must be at least 5 character long!",
        "string.max": "Your password is limited to 50 character only!"
      }),
    address: Joi.string().allow(""),
    phone: Joi.string().allow(""),
    image: Joi.string().allow(""),
    roleId: Joi.string().allow(""),
    status: Joi.string().required()
      .messages({
        "any.required": "Your account is required!",
        "string.empty": "your account status are blank!"
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