const mongoose = require("mongoose");

const WhiteboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      default: "Untitled Whiteboard",
    },
    drawingData: {
      type: mongoose.Schema.Types.Mixed, // Can be string (JSON) or array
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Whiteboard", WhiteboardSchema);
