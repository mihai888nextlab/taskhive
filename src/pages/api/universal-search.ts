import type { NextApiRequest, NextApiResponse } from "next";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import connectDB from "@/db/dbConfig"; // Asigură-te că această cale este corectă
import { JWTPayload } from "@/types";
import userModel from "@/db/models/userModel";
import userCompanyModel from "@/db/models/userCompanyModel";
import Task from "@/db/models/taskModel";
import ExpenseModel from "@/db/models/expensesModel";
// TODO: Importă aici toate celelalte modele relevante pentru căutare (ex: Page, Project etc.)

const verifyAuthToken = async (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = cookie.parse(req.headers.cookie || "");
  const token = cookies.auth_token;

  if (!token) {
    return null;
  }

  const decodedToken: JWTPayload | null = jwt.verify(
    token,
    process.env.JWT_SECRET || ""
  ) as JWTPayload;

  if (!decodedToken) {
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: -1,
        path: "/",
      })
    );
    return null;
  }

  try {
    // Fetch user from userModel
    const user = await userModel.findOne({
      _id: decodedToken.userId,
      email: decodedToken.email,
    });

    if (!user) {
      return null;
    }

    const userCompany = await userCompanyModel.findOne({
      userId: decodedToken.userId,
    });

    if (!userCompany) {
      return null;
    }

    // Combine user data and role
    const userWithRole = {
      ...user._doc,
      role: userCompany.role,
      companyId: userCompany.companyId,
    };

    return userWithRole; // Returnează utilizatorul cu rolul său
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  await connectDB();

  const authResult = await verifyAuthToken(req, res);
  if (!authResult || !authResult?._id || !authResult.companyId) {
    console.log(authResult._id);
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { userId, companyId } = authResult;
  const { q } = req.query;
  const searchTerm = typeof q === "string" ? q.trim() : "";

  if (!searchTerm) {
    return res.status(200).json({ results: [] });
  }

  const searchPromises: Promise<any>[] = []; // Array pentru a stoca promisiunile de căutare
  const results: any = {
    tasks: [],
    users: [],
    announcements: [],
    calendarEvents: [],
    storageFiles: [],
    timeTracking: [],
    financeRecords: [],
    timeSessions: [],
    expenses: [],
    incomes: [],
  };

  // Creăm o expresie regulară (regex) pentru căutare.
  // 'i' face căutarea case-insensitive (ignoră majuscule/minuscule).
  const regex = new RegExp(searchTerm, "i");

  // Adăugăm promisiunile de căutare pentru fiecare model.
  // Fiecare căutare va fi filtrată pe baza `companyId` pentru securitate și relevanță.
  // `limit(5)` este folosit pentru a returna doar câteva rezultate per categorie, menținând rapiditatea.
  // `lean()` este pentru performanță, returnează obiecte JS simple.

  // Căutare în Task-uri
  searchPromises.push(
    Task.find({
      userId: userId, // FOARTE IMPORTANT: Filtrează pe compania utilizatorului!
      $or: [{ title: { $regex: regex } }, { description: { $regex: regex } }],
    })
      .limit(5)
      .lean()
      .then((tasks) => {
        // Adaugă un câmp 'type' pentru a diferenția rezultatele în frontend
        results.tasks = tasks.map((t) => ({ ...t, type: "task" }));
      })
  );

  // Căutare în Utilizatori

  //   await userCompanyModel
  //         .find({
  //           companyId: decodedToken.companyId,
  //         })
  //         .populate("userId", "firstName lastName email profileImage description");
  searchPromises.push(
    userCompanyModel
      .find({
        companyId: companyId, // Filtrează pe companie
        $or: [
          { firstName: { $regex: regex } },
          { lastName: { $regex: regex } },
          { email: { $regex: regex } },
        ],
      })
      .limit(5)
      .lean()
      .then((users) => {
        results.users = users.map((u) => ({
          ...u,
          type: "user",
          fullName: `${u.firstName} ${u.lastName}`,
        }));
      })
  );

  // Căutare în Expenses
  searchPromises.push(
    ExpenseModel.find({
      companyId: companyId, // Filtrează pe companie
      type: "expense", // Asigură-te că filtrezi doar cheltuielile
      $or: [
        { description: { $regex: regex } },
        { category: { $regex: regex } },
      ],
    })
      .limit(5)
      .lean()
      .then((expenses) => {
        results.expenses = expenses.map((e) => ({ ...e, type: "expense" }));
      })
  );

  // Căutare în Incomes
  searchPromises.push(
    ExpenseModel.find({
      companyId: companyId, // Filtrează pe companie
      type: "income", // Asigură-te că filtrezi doar veniturile
      $or: [{ description: { $regex: regex } }, { source: { $regex: regex } }],
    })
      .limit(5)
      .lean()
      .then((incomes) => {
        results.incomes = incomes.map((i) => ({ ...i, type: "income" }));
      })
  );

  // TODO: Adaugă aici logica similară pentru toate celelalte tipuri de date (pagini, documente etc.)
  // Exemplu pentru Pages:
  /*
  searchPromises.push(
    Page.find({
      company: companyId,
      $or: [
        { title: { $regex: regex } },
        { content: { $regex: regex } },
      ],
    }).limit(5).lean().then(pages => { results.pages = pages.map(p => ({ ...p, type: 'page' })); })
  );
  */

  try {
    // Așteaptă ca toate promisiunile de căutare să se finalizeze în paralel
    await Promise.all(searchPromises);
    // Returnează rezultatele agregate
    return res.status(200).json({ results });
  } catch (error) {
    console.error("Universal search API error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during search" });
  }
}
