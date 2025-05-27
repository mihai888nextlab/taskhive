import mongoose, { Schema, Document } from "mongoose";

interface Level {
  id: string;
  roles: string[];
}

interface IOrgChart extends Document {
  levels: Level[];
  availableRoles: string[];
}

const OrgChartSchema: Schema = new Schema({
  levels: [
    {
      id: { type: String, required: true },
      roles: { type: [String], default: [] },
    },
  ],
  availableRoles: { type: [String], default: [] },
});

export default mongoose.models.OrgChart || mongoose.model<IOrgChart>("OrgChart", OrgChartSchema);