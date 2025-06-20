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

  const decodedToken: JWTPayload | null = jwt.verify(
    token,
    process.env.JWT_SECRET || ""
  ) as JWTPayload;

  if (req.method === "POST") {
    const { title, amount, description, type, category, date } = req.body; // <-- add date

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(decodedToken.userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const expense = new Expense({
      userId: decodedToken.userId, // Use userId from the decoded token
      companyId: decodedToken.companyId, // Use companyId from the decoded token
      title,
      amount,
      description,
      type, // Ensure type is included here
      category: category || "General", // Ensure category is included here
      date, // <-- add date here
    });

    try {
      await expense.save();
      return res.status(201).json(expense);
    } catch (error: any) {
      console.error("Error saving expense:", error);
      return res
        .status(500)
        .json({ message: "Error saving expense", error: error.message });
    }
  } else if (req.method === "GET") {
    // Optionally filter by userId/companyId if needed
    const { userId, companyId } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (companyId) filter.companyId = companyId;
    const expenses = await Expense.find(filter).sort({ date: -1 });
    return res.status(200).json(expenses);
  } else if (req.method === "DELETE") {
    // Add DELETE method handler
    const { id } = req.query; // Get the ID from the query parameters

    if (!id) {
      return res
        .status(400)
        .json({ message: "Item ID is required for deletion." });
    }

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).json({ message: "Invalid item ID format." });
    }

    try {
      const deletedItem = await Expense.findByIdAndDelete(id);

      if (!deletedItem) {
        return res.status(404).json({ message: "Item not found." });
      }

      return res
        .status(200)
        .json({ message: "Item deleted successfully.", deletedItem });
    } catch (error: any) {
      console.error("Error deleting item:", error);
      return res
        .status(500)
        .json({ message: "Error deleting item", error: error.message });
    }
  } else {
    // Handle any other methods that are not explicitly defined
    res.setHeader("Allow", ["POST", "GET", "DELETE"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
