import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import Role from "@/db/models/roleModel";
import * as cookie from "cookie";
import { JWTPayload } from "@/types";
import jwt from "jsonwebtoken";

const DEFAULT_ADMIN_ROLE = "admin";

async function ensureAdminRoleExists(companyId: string | null) {
  try {
    const adminRole = await Role.findOne({
      name: DEFAULT_ADMIN_ROLE,
      companyId,
    });
    if (!adminRole) {
      await Role.create({ name: DEFAULT_ADMIN_ROLE, companyId });
      console.log("Default admin role created.");
    }
  } catch (error) {
    console.error("Error ensuring admin role exists:", error);
  }
}

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

  await ensureAdminRoleExists(decodedToken?.companyId);

  if (req.method === "GET") {
    try {
      const roles = await Role.find({ companyId: decodedToken?.companyId });
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
      const newRole = await Role.create({
        name,
        companyId: decodedToken?.companyId,
      });

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
