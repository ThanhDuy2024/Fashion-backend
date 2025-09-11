import mongoose from "mongoose";
const slug = require("mongoose-slug-updater");
const { Schema } = mongoose;
mongoose.plugin(slug);

const schema = new Schema({
  fullName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  status: {
    type: String,
    default: "active"
  },
  deleted: {
    type: Boolean,
    default: false
  },
  image: String,
  phone: String,
  address: String,
  birthDay: String,
  bankCode: String,
  
  deletedBy: String,
  deletedAt: Date,
  updatedBy: String,
  slug: {
    type: String,
    slug: "fullName",
    unique: true
  }
}, {
  timestamps: true
})

export const AccountClient = mongoose.model("AccountClient", schema, "account-client");