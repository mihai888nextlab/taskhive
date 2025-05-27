import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import OrgChart from "@/db/models/orgChartModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const orgChart = await OrgChart.findOne();
      res.status(200).json(orgChart);
    } catch (error) {
      console.error("Error fetching org chart:", error);
      res.status(500).json({ message: "Failed to fetch org chart." });
    }
  } else if (req.method === "POST") {
    try {
      const { levels, availableRoles } = req.body;

      // Check if an org chart already exists
      const existingOrgChart = await OrgChart.findOne();

      if (existingOrgChart) {
        // Update the existing org chart
        existingOrgChart.levels = levels;
        existingOrgChart.availableRoles = availableRoles;
        await existingOrgChart.save();
        res.status(200).json({ message: "Org chart updated successfully." });
      } else {
        // Create a new org chart
        await OrgChart.create({ levels, availableRoles });
        res.status(201).json({ message: "Org chart created successfully." });
      }
    } catch (error) {
      console.error("Error saving org chart:", error);
      res.status(500).json({ message: "Failed to save org chart." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}