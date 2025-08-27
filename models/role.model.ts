import mongoose from "mongoose";
const slug = require("mongoose-slug-updater");
const { Schema } = mongoose;
mongoose.plugin(slug);

const schema = new Schema({
  name: String,
  permission: Array,
  status: {
    type: String,
    default: "active",
  },
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
    slug: "name",
    unique: true
  }
}, {
  timestamps: true
})

export const Role = mongoose.model("Role", schema, "role");