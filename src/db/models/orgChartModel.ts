import mongoose, { Schema, Document } from "mongoose";

interface Level {
  id: string;
  roles: string[];
}

interface Department {
  id: string;
  name: string;
  levels: Level[];
}

export interface IOrgChart extends Document {
  departments: Department[];
  availableRoles: string[];
  companyId: mongoose.Types.ObjectId;
}

const LevelSchema = new Schema({
  id: { type: String, required: true },
  roles: { type: [String], default: [] },
});

const DepartmentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  levels: { type: [LevelSchema], default: [] },
});

const OrgChartSchema: Schema = new Schema({
  departments: { type: [DepartmentSchema], default: [] },
  availableRoles: { type: [String], default: [] },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
});

// Option 1: Add a static method to get all roles, always including 'admin' on top
OrgChartSchema.statics.getLevelsWithAdmin = function (levels: Level[]) {
  // If 'admin' is not already in the first level, add it
  if (!levels.length) return [{ id: "admin-level", roles: ["admin"] }];
  const firstLevel = levels[0];
  const normalizedRoles = firstLevel.roles.map((r) => r.trim().toLowerCase());
  if (!normalizedRoles.includes("admin")) {
    // Add 'admin' to the top
    return [{ id: "admin-level", roles: ["admin"] }, ...levels];
  }
  // if (levels.length === 1) {
  //   levels.push({ id: "default-level", roles: [] });
  // }
  return levels;
};

// Extend the model type to include the static method
interface OrgChartModelType extends mongoose.Model<IOrgChart> {
  getLevelsWithAdmin(levels: Level[]): Level[];
}

export default (mongoose.models.OrgChart as OrgChartModelType) ||
  mongoose.model<IOrgChart, OrgChartModelType>("OrgChart", OrgChartSchema);
