import dbConnect from "@/db/dbConfig";
import Expense from "@/db/models/expensesModel";
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  let decodedToken: JWTPayload | null = null;
  try {
    decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JWTPayload;
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (req.method === "GET") {
    const companyId = decodedToken.companyId;
    const expenses = await Expense.find({ companyId }).sort({ date: -1 });
    return res.status(200).json(expenses);
  }

  if (req.method === "POST") {
    const { title, amount, description, type, category, date } = req.body || {};

    const userId = decodedToken.userId;
    const isValidObjectId =
      typeof mongoose.isValidObjectId === "function"
        ? mongoose.isValidObjectId
        : mongoose.Types.ObjectId.isValid;
    if (!userId || typeof userId !== "string" || !isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const expense = new (Expense as any)({
      userId: decodedToken.userId,
      companyId: decodedToken.companyId,
      title,
      amount,
      description,
      type,
      category: category || "General",
      date,
    });

    try {
      await expense.save();
      return res.status(201).json(expense);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error saving expense", error: error.message });
    }
  } else if (req.method === "DELETE") {
    let id = (req.query as any).id;
    if (Array.isArray(id)) id = id[0];
    if (!id) {
      return res
        .status(400)
        .json({ message: "Item ID is required for deletion." });
    }

    const isValidObjectId =
      typeof mongoose.isValidObjectId === "function"
        ? mongoose.isValidObjectId
        : mongoose.Types.ObjectId.isValid;
    if (!isValidObjectId(id as string)) {
      return res.status(400).json({ message: "Invalid item ID format." });
    }

    try {
      const deletedItem = await (Expense as any).findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({ message: "Item not found." });
      }

      return res
        .status(200)
        .json({ message: "Item deleted successfully.", deletedItem });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Error deleting item", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
