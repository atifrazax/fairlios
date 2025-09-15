const Group = require("../models/group.model");
const Expense = require("../models/expense.model");
const createError = require("../utils/error.msgs");
const crypto = require("crypto");

// Add New Expense (either new group or existing group by code)
const newGroup = async (req, res, next) => {
  try {
    
    const { expenseCode } = req.body;
    const userId = req.user._id;

    let group;

    if (expenseCode && expenseCode.trim() !== "") {
      // User wants to add expense in existing group
      group = await Group.findOne({ expenseCode: expenseCode.trim() });

      if (!group) {
        req.flash("error", "Group not found. Please create a new group");
        return res.redirect("/");
      }

      // Ensure user is in members
      if (!group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();

        req.flash("success", "Group added successfully");
        return res.redirect("/");

      } else {
        req.flash("error", "You are already a member of this group");
        return res.redirect("/");
      }

    } else {
      // Create new group if no code provided
      const newCode = "EXP-" + crypto.randomBytes(4).toString("hex").toUpperCase();

      group = new Group({
        expenseCode: newCode,
        createdBy: userId,
        members: [userId]
      });

      const newGroup =await group.save();
      
      req.flash("success", `Group created successfully with code: ${newGroup.expenseCode}`);
      return res.redirect("/");
    }

  } catch(err) {
    const messages = [];
    if (err.name === 'ValidationError' && err.errors) {
    
      for (let field in err.errors) {
        messages.push(err.errors[field].message);
      }
      req.flash("error", messages);
      req.flash("data", req.body);
      return res.redirect('/')
      
    } else {
      return next(err);
    }
  }
};
// Delete Group 
const deleteGroup = async (req, res, next) => {
  try {
    const expenseCode = req.params.code;
    const { confirmCode } = req.body; // code entered in modal form

    const group = await Group.findOne({ expenseCode }).lean();

    if (!group) {
      return next(createError("Group not found", 404));
    }
    // Only group creator can delete
    if (group.createdBy.toString() !== req.user._id) {
      return next(createError("Only creator can delete this group", 403));
    }

    // Check entered code matches
    if (confirmCode !== expenseCode) {
      return next(createError("Confirmation code does not match", 400));
    }

    // Delete all expenses linked to group
    await Expense.deleteMany({ group: group._id });

    // Delete group itself
    await Group.deleteOne({ _id: group._id });

    // Redirect back to dashboard
    res.redirect("/"); 

  } catch (err) {
    return next(err)
  }
};


module.exports = { deleteGroup, newGroup };
