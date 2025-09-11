const mongoose = require("mongoose");
const paginate = require('mongoose-paginate-v2');

const expenseSchema = new mongoose.Schema({
  group: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: [ true, "❌ Could not find group" ],
    ref: "Group" 
  },
    title: {
      type: String, 
      required: [ true, "❌ Title is required" ],
      maxlength: [10, "❌ Title must be at most 10 characters long"],
      trim: true
  },
    amount: {
      type: Number , 
      required: [true, "❌ Amount is required"],
      min: [1, "❌ Amount must be greater than 0"] 
  },
    note: {
      type: String,
      maxlength: [100, "❌ Note must be at most 100 characters long"]      
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: [true, "❌ Could not find user"] },
    date: { 
      type: Date, 
      default: Date.now 
  }
});

expenseSchema.plugin(paginate);
module.exports = mongoose.model("Expense", expenseSchema);
