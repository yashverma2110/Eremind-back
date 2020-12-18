const mongoose = require("mongoose");

const reminderSchema = new mongoose.Schema(
  {
    to: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Remind = mongoose.model("Reminder", reminderSchema);

module.exports = Remind;
