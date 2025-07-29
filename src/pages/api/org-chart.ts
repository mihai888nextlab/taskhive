import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/db/dbConfig";
import OrgChart from "@/db/models/orgChartModel";
import Role from "@/db/models/roleModel";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types";
import userCompanyModel from "@/db/models/userCompanyModel";

const AVAILABLE_DEPT_ID = "available-roles";
const AVAILABLE_DEPT_NAME = "Available Roles";

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

  if (req.method === "GET") {
    try {
      let orgChart = await OrgChart.findOne({
        companyId: decodedToken?.companyId,
      });
      if (!orgChart) {
        orgChart = await OrgChart.create({
          companyId: decodedToken?.companyId,
          departments: [],
        });
      }

      if (orgChart.availableRoles) orgChart.availableRoles = [];

      const allRoles = await Role.find({ companyId: decodedToken?.companyId });
      const allRoleNames = allRoles.map((r) => r.name);

      const assignedRoles = orgChart.departments
        .flatMap((dept: any) => dept.levels.flatMap((lvl: any) => lvl.roles));

      const unassignedRoles = allRoleNames.filter(
        (role) => !assignedRoles.includes(role) && role !== "admin"
      );

      let availableDept = orgChart.departments.find(
        (d: any) => d.id === AVAILABLE_DEPT_ID
      );
      if (!availableDept) {
        availableDept = {
          id: AVAILABLE_DEPT_ID,
          name: AVAILABLE_DEPT_NAME,
          levels: [{ id: "available-roles-level", roles: [] }],
        };
        orgChart.departments.unshift(availableDept);
      }
      availableDept.levels[0].roles = Array.from(
        new Set([...availableDept.levels[0].roles, ...unassignedRoles])
      );

      orgChart.markModified("departments");
      await orgChart.save();

      res.status(200).json({
        departments: orgChart.departments,
      });
    } catch (error) {
      console.error("Error fetching org chart:", error);
      res.status(500).json({ message: "Failed to fetch org chart." });
    }
  } else if (req.method === "POST") {
    try {
      const { departments } = req.body;
      let orgChart = await OrgChart.findOne({
        companyId: decodedToken?.companyId,
      });
      if (orgChart) {
        orgChart.departments = departments;
        await orgChart.save();

        for (const dept of departments) {
          if (dept.id === AVAILABLE_DEPT_ID) continue;
          for (const level of dept.levels) {
            for (const role of level.roles) {
              await userCompanyModel.updateMany(
                {
                  role: role.toLowerCase(), // assuming you store roles as lowercase
                  companyId: decodedToken.companyId,
                },
                { $set: { departmentId: dept.id } }
              );
            }
          }
        }

        res.status(200).json({ message: "Org chart updated successfully." });
      } else {
        await OrgChart.create({
          departments,
          companyId: decodedToken?.companyId,
        });
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
