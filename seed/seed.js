const mongoose = require("mongoose");
const crypto = require("crypto");


// ✅ Your Expense model (adjust path if needed)
const Expense = require("");

// 🔹 Connect to MongoDB
mongoose.connect("", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🔹 Custom groupId (replace with real ObjectId from your Groups collection)
const groupId = ""; 
const userId = ""; 

// 🔹 Helper functions
const randomName = () => {
  const names = ["Ali", "Raza", "Sara", "John", "Zara", "Omar", "Maya", "Usman"];
  return names[Math.floor(Math.random() * names.length)];
};

const randomAmount = () => {
  return Math.floor(Math.random() * 5000) + 1; // amount > 0
};

const randomNote = () => {
  const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";
  const length = Math.floor(Math.random() * 100); // up to 100 chars
  return lorem.substring(0, length);
};

// 🔹 Generate random expenses
async function seedExpenses(count = 10) {
  try {
    const expenses = [];

    for (let i = 0; i < count; i++) {
      expenses.push({
        group: groupId,
        title: randomName(),
        amount: randomAmount(),
        note: randomNote(),
        createdBy: userId, 
      });
    }

    await Expense.insertMany(expenses);
    console.log(`${count} expenses added successfully ✅`);

  } catch (err) {
    console.error("❌ Error seeding expenses:", err.message);
  } finally {
    mongoose.connection.close();
  }
}

// Run seeder
seedExpenses(2500); 
