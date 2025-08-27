import { NextFunction, Request, Response } from "express";
import Joi from "joi";


export const roleValidate = async (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required()
      .messages({
        "string.empty": "Role name is blank!",
        "string.min": " The role must be at least 3 character long!", 
        "string.max": "The role is limited to 50 characters only!"
      }),
    permission: Joi.allow()
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