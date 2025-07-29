import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/db/dbConfig';
import AnnouncementModel from '@/db/models/announcementModel';
import UserModel from '@/db/models/userModel';
import * as cookie from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();
  const {
    query: { id },
    method,
  } = req;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid announcement id' });
  }

  switch (method) {
    case 'GET': {
      
      const announcement = await AnnouncementModel.findById(id).populate({
        path: 'comments.user',
        select: 'firstName lastName email',
      });
      if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
      const comments = (announcement.comments || []).map((c: any) => ({
        _id: c._id,
        user: c.user ? {
          firstName: c.user.firstName,
          lastName: c.user.lastName,
          email: c.user.email,
        } : null,
        text: c.text,
        createdAt: c.createdAt,
      }));
      return res.status(200).json({ comments });
    }
    case 'POST': {
      
      const cookies = cookie.parse(req.headers.cookie || "");
      const token = cookies.auth_token;
      if (!token) {
        return res.status(401).json({ error: 'No auth token' });
      }
      let decoded: JwtPayload | null = null;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || "") as JwtPayload;
      } catch {
        return res.status(401).json({ error: 'Invalid token' });
      }
      if (!decoded || !decoded.userId) {
        return res.status(401).json({ error: 'Invalid token payload' });
      }
      const { text } = req.body;
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Comment text required' });
      }
      const user = await UserModel.findById(decoded.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const comment = {
        user: user._id,
        text,
        createdAt: new Date(),
      };
      const announcement = await AnnouncementModel.findByIdAndUpdate(
        id,
        { $push: { comments: comment } },
        { new: true }
      ).populate({
        path: 'comments.user',
        select: 'firstName lastName email',
      });
      if (!announcement) return res.status(404).json({ error: 'Announcement not found' });
      const newComment = announcement.comments[announcement.comments.length - 1];
      return res.status(201).json({
        comment: {
          _id: newComment._id,
          user: newComment.user ? {
            firstName: newComment.user.firstName,
            lastName: newComment.user.lastName,
            email: newComment.user.email,
          } : null,
          text: newComment.text,
          createdAt: newComment.createdAt,
        },
      });
    }
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
