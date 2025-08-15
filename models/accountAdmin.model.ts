import mongoose from "mongoose";
const slug = require("mongoose-slug-updater");
const { Schema } = mongoose;
mongoose.plugin(slug)

const schema = new Schema({
  fullName: String,
  email: String,
  password: String,
  address: String,
  phone: String,
  image: String,
  roleId: String,
  status: String,
  deleted: {
    type: Boolean,
    default: false
  },
  deletedBy: String,
  deletedAt: Date,
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "fullName",
    unique: true
  }
}, {
  timestamps: true
})

export const AccountAdmin = mongoose.model("AccountAdmin", schema, "account-admin");