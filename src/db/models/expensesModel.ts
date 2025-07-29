
import mongoose from "mongoose";


export interface Expense {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: "expense";
  companyId: string;
  userId: string;
  date: Date;
  category: string;
}

export interface Income {
  _id: string;
  title: string;
  amount: number;
  description: string;
  type: "income";
  companyId: string;
  userId: string;
  date: Date;
  category: string;
}

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now, required: true },
  type: { type: String, enum: ["expense", "income"], required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  category: { type: String, default: "General", required: true },
});

// Check if the model already exists
const ExpenseModel =
  mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);

export default ExpenseModel;
