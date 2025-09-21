import mongoose from "mongoose";
const slug = require("mongoose-slug-updater");
const { Schema } = mongoose;

const schema = new Schema({
  name: String,
  image: String,
  address: String,
  phone: String,
  status: String,
  createdBy: String,
  updatedBy: String,
  slug: {
    type: String,
    slug: "name",
    unique: true
  }
}, {
  timestamps: true
});

export const Branch = mongoose.model("Branch", schema, "branch");