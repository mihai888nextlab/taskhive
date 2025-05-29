// models/Expense.js
import mongoose from "mongoose";

// Define the Expense and Income interfaces
export interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: "expense";
  companyId: string;
}

export interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: "income";
  companyId: string;
}

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["expense", "income"], required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

// Check if the model already exists
const ExpenseModel =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default ExpenseModel;
