import dbConnect from '@/db/dbConfig';
import UserCompany from '@/db/models/userCompanyModel';
import Company from '@/db/models/companyModel';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  const { userId } = req.query; // Get the user ID from the query

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    // Fetch the user company association
    const userCompany = await UserCompany.findOne({ userId }).populate('companyId');

    if (!userCompany || !userCompany.companyId) {
      return res.status(404).json({ message: "Company not found for this user" });
    }

    return res.status(200).json(userCompany.companyId); // Return the company details
  } catch (error: any) {
    console.error("Error fetching company by user:", error);
    return res.status(500).json({ message: "Error fetching company", error: error.message });
  }
}
