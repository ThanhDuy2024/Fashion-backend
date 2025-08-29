import mongoose from "mongoose";
const slug = require("mongoose-slug-updater");
const { Schema } = mongoose;
mongoose.plugin(slug);

const schema = new Schema({
  name: String,
  categoryIds: Array,
  image: String,
  images: Array,
  sex: String,
  styleIds: Array,
  season: String,
  size: Array,
  material: String,
  quantity: Number,
  originPrice: Number,
  currentPrice: Number,
  orginOfProduction: String, //xuat su
  status: {
    type: String,
    default: "active"
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

export const Product = mongoose.model("Product", schema, "products");