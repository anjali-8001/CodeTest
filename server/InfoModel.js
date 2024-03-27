const mongoose = require("mongoose");

const InfoSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    language: {
      type: String,
    },
    stdin: {
      type: String,
    },
    code: {
      type: String,
    },
    output: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("info", InfoSchema);
