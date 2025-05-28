import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import userModel from "@/db/models/userModel";
import taskModel from "@/db/models/taskModel"; // Assuming you have a task model

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  try {
    // Get total users
    const totalUsers = await userModel.countDocuments();

    // Get users created in the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const newUsers = await userModel.countDocuments({ createdAt: { $gte: last7Days } });

    // Get total tasks
    const totalTasks = await taskModel.countDocuments();

    // Get completed tasks in the last 7 days
    const completedTasks = await taskModel.countDocuments({
      completed: true,
      updatedAt: { $gte: last7Days },
    });

    // Fetch new users data for the last 7 days
    const newUsersData = await userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: { $dayOfYear: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Fetch completed tasks data for the last 7 days
    const completedTasksData = await taskModel.aggregate([
      {
        $match: {
          completed: true,
          updatedAt: { $gte: last7Days },
        },
      },
      {
        $group: {
          _id: { $dayOfYear: "$updatedAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format the data to match the last 7 days
    const formattedNewUsersData = Array(7).fill(0);
    newUsersData.forEach((day) => {
      formattedNewUsersData[day._id - 1] = day.count; // Adjust index based on your aggregation
    });

    const formattedCompletedTasksData = Array(7).fill(0);
    completedTasksData.forEach((day) => {
      formattedCompletedTasksData[day._id - 1] = day.count; // Adjust index based on your aggregation
    });

    res.status(200).json({
      totalUsers,
      newUsers,
      totalTasks,
      completedTasks,
      newUsersData: formattedNewUsersData,
      completedTasksData: formattedCompletedTasksData,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ message: "Error fetching statistics" });
  }
}