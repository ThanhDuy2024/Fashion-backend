import { Request } from "express";

export interface client extends Request {
  client?:any
}