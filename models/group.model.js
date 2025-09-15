const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const groupSchema = new mongoose.Schema({
  expenseCode: { 
    type: String, 
    trim : true,
    // match: [/^EXP-[A-F0-9]{8}$/, "❌ Invalid expense group code"],
    required: [true, "❌ Expense code is required"],
    unique: [true, "❌ Expense code already exists"] 
},
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "❌ Could not find creator"],
    ref: "User" 
},
  members: [{ 
    type: mongoose.Schema.Types.ObjectId,
    required: [true, "❌ At least one member is required"],
    ref: "User",
}],
}, { timestamps: true });

groupSchema.plugin(paginate);
module.exports = mongoose.model("Group", groupSchema);
