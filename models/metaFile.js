const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

// Schema
const metaFileSchema = new Schema(
  {
    // You must have name
    name: {
      type: String,
      min: 3,
      max: 99,
      required: [true, "Name is required"]
    },
    // Access limit not required
    accessLimit: {
      type: Number,
      min: 0,
    },
    timeLimit: {
      type: Date,
      default: moment().add({ year: 1 }).set({ hour: 23, minute: 59 }).toDate(),
    },
    // Id of for Upload/download section
    fileId: {
      type: String,
      required: true,
      unique: true,
    },
    // Is MetaFile accessible.
    availability: Boolean
  },
  {
    timestamps: true
  }
);

module.exports = MetaFile = mongoose.model("metaFile", metaFileSchema);
