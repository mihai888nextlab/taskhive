import { NextApiRequest } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';

export async function verifyToken(req: NextApiRequest): Promise<string | null> {
  const token = req.cookies.auth_token || "";

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
    return decodedToken.userId as string; // Assuming your payload has userId
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}