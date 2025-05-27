import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Role from "@/db/models/roleModel";

const DEFAULT_ADMIN_ROLE = "admin";

async function ensureAdminRoleExists() {
  try {
    const adminRole = await Role.findOne({ name: DEFAULT_ADMIN_ROLE });
    if (!adminRole) {
      await Role.create({ name: DEFAULT_ADMIN_ROLE });
      console.log("Default admin role created.");
    }
  } catch (error) {
    console.error("Error ensuring admin role exists:", error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  // Ensure admin role exists on every request
  await ensureAdminRoleExists();

  if (req.method === "GET") {
    try {
      const roles = await Role.find();
      res.status(200).json(roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Failed to fetch roles." });
    }
  } else if (req.method === "POST") {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Role name is required." });
    }

    try {
      const newRole = await Role.create({ name });
      res.status(201).json(newRole);
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Failed to create role." });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed.` });
  }
}