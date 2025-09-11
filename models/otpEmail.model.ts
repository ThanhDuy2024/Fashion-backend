import mongoose from "mongoose";

const { Schema, model} = mongoose;

const schema = new Schema({
  fullName: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  expireAt: {
    type: Date,
    expires: 0
  },
  otp: {
    type: String,
    require: true 
  }
});

export const OtpEmail = model("OtpEmail", schema, "otp-email");