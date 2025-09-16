const Expense = require("../models/expense.model");
const crypto = require("crypto");
const Group = require("../models/group.model");
const createError = require("../utils/error.msgs");
const paginate = require("../utils/paginate");
const pdf = require("html-pdf-node");
const ejs = require("ejs");
const path = require("path");


// Add Expense without Code field
const addExpense = async (req, res, next) => {
  try {
    const expenseCode = req.params.code
    const group = await Group.findOne( {expenseCode} ).lean()
      if (!group) return next(createError("Group not found", 404))

        const createdBy = req.user._id
        if (!createdBy) return next(createError("Creator must be logged in", 403))
        
        const { title, amount, note } = req.body

          const newExpense = new Expense({
            group : group._id,
            title,
            amount,
            note,
            createdBy : createdBy
          })
          await newExpense.save()
          req.flash("success", "Expense added successfully")
          res.redirect(`/expense/group-detail/${group.expenseCode}`)
          
  } catch(err) {
  const messages = [];
  if (err.name === 'ValidationError' && err.errors) {
  
    for (let field in err.errors) {
      messages.push(err.errors[field].message);
    }
    req.flash("error", messages);
    req.flash("data", req.body);
    return res.redirect(`/expense/group-detail/${req.params.code}`)
    
  } else {
    return next(err);
  }
}
}
// Group Detail Page (with aggregation)
const groupDetail = async (req, res, next) => {
  try {
    const expenseCode = req.params.code;

    const group = await Group.findOne({ expenseCode })
      .populate("members", "name email")
      .lean();

    if (!group) {
      return next(createError("Group not found", 404));
    }

    // 🔹 1. Paginate expenses (for display)
    const paginatedExpenses = await paginate(
      Expense,
      { group: group._id },
      req.query,
      {
        populate: [{ path: "createdBy", select: "_id name email" }],
        sort: "-date",
        limit: 12,
      }
    );

    const expenses = paginatedExpenses.data;
    const paginatedMeta = paginatedExpenses.meta;

    // 🔹 2. Aggregation to calculate per-user totals
    const totals = await Expense.aggregate([
      { $match: { group: group._id } },
      {
        $group: {
          _id: "$createdBy", // always use userId
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "users", // name of User collection
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          total: 1,
          name: "$user.name",
        },
      },
    ]);

    // 🔹 3. Map totals into object for quick lookup
    let perUserTotals = {};
    totals.forEach((t) => {
      perUserTotals[t._id.toString()] = {
        name: t.name,
        total: t.total,
      };
    });

    // 🔹 4. Group total
    let totalGroup = totals.reduce((sum, t) => sum + t.total, 0);

    // 🔹 5. Average share
    let avgShare =
      group.members.length > 0 ? totalGroup / group.members.length : 0;

    // 🔹 6. Balances for each member (by _id)
    let balances = group.members.map((m) => {
      const uid = m._id.toString();
      const spent = perUserTotals[uid]?.total || 0;
      const balance = spent - avgShare;

      return {
        userId: uid,
        name: m.name,
        spent: Number(spent.toFixed(2)),
        balance: Number(balance.toFixed(2)),
        status:
          balance > 0
            ? `${balance.toFixed(2)}`
            : balance < 0
            ? `${Math.abs(balance).toFixed(2)}`
            : "Settled",
      };
    });
    
    // 🔹 7. Render
    res.render("group-detail", {
      user: req.user,
      group,
      expenses, // only paginated data
      perUserTotals,
      balances,
      totalGroup: Number(totalGroup.toFixed(2)),
      avgShare: Number(avgShare.toFixed(2)),
      paginatedMeta, // meta for pagination
    });
  } catch (err) {
    return next(err);
  }
};
// Print Group Detail (with aggregation)
const groupDetailPrint = async (req, res, next) => {
  try {
    const expenseCode = req.params.code;

    const group = await Group.findOne({ expenseCode })
      .populate("members", "name email")
      .lean();

    if (!group) {
      return next(createError("Group not found", 404));
    }

    const expenses = await Expense.find({ group: group._id })
      .populate("createdBy", "name email").sort("-date")
      .lean();
      
    // 🔹 2. Aggregation to calculate per-user totals
    const totals = await Expense.aggregate([
      { $match: { group: group._id } },
      {
        $group: {
          _id: "$createdBy", // always use userId
          total: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "users", // name of User collection
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          total: 1,
          name: "$user.name",
        },
      },
    ]);

    // 🔹 3. Map totals into object for quick lookup
    let perUserTotals = {};
    totals.forEach((t) => {
      perUserTotals[t._id.toString()] = {
        name: t.name,
        total: t.total,
      };
    });

    // 🔹 4. Group total
    let totalGroup = totals.reduce((sum, t) => sum + t.total, 0);

    // 🔹 5. Average share
    let avgShare =
      group.members.length > 0 ? totalGroup / group.members.length : 0;

    // 🔹 6. Balances for each member (always keyed by _id)
    let balances = group.members.map((m) => {
      const uid = m._id.toString();
      const spent = perUserTotals[uid]?.total || 0;
      const balance = spent - avgShare;

      return {
        userId: uid,
        name: m.name,
        spent: Number(spent.toFixed(2)),
        balance: Number(balance.toFixed(2)),
        status:
          balance > 0
            ? `Gets ${balance.toFixed(2)}`
            : balance < 0
            ? `Owes ${Math.abs(balance).toFixed(2)}`
            : "Settled",
      };
    });

    // ----PDF code
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "../views/group-detail-print.ejs"),
      {
        user: req.user,
        group,
        expenses,
        perUserTotals,
        balances,
        totalGroup: Number(totalGroup.toFixed(2)),
        avgShare: Number(avgShare.toFixed(2)),
      }
    );
    let file = { content: htmlContent };
    const pdfBuffer = await pdf.generatePdf(file, {
      format: "A4",
      margin: {
        top: "1cm",
        bottom: "1cm",
        left: "1cm",
        right: "1cm",
      },
    });

    // prevent stale cache
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    // Send PDF response
    res.contentType("application/pdf");
    if (req.query.download === "true") {
      res.setHeader("Content-Disposition", `attachment; filename=FAIRLIOS-${group.expenseCode}-REPORT-${new Date().toISOString()}.pdf`);
    } else {
      // default: open inline
      res.setHeader("Content-Disposition", `inline; filename=FAIRLIOS-${group.expenseCode}-REPORT-${new Date().toISOString()}.pdf`);
    }
    res.send(pdfBuffer);

  } catch (err) {
    return next(err);
  }
};
// Delete expense (only creator)
const deleteExpense = async (req, res, next) => {
  try {
    const expenseId = req.params.id;

    const expense = await Expense.findById(expenseId).lean();

    const expenseGroup = expense.group.toString()
    const groupCode = await Group.findById(expenseGroup).lean();
    
    if (!expense) {
      return next(createError("Expense not found", 404));
    }

    if (expense.createdBy.toString() !== req.user._id) {
      return next(createError("Only creator can delete this expense", 403));
    }

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);
    if (!deletedExpense) {
      return next(createError("Something went wrong", 500));
    }
    req.flash("success", "Expense deleted");
    res.redirect(`/expense/group-detail/${groupCode.expenseCode}`);
  } catch (err) {
    return next(err)
  }
};

module.exports = { addExpense, deleteExpense, groupDetail, groupDetailPrint };
