import { NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Utility function to verify token
const verifyToken = (token: string) => {
  if (!token) {
    throw new Error('Unauthorized: No token provided');
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new Error('Unauthorized: Invalid token');
  }
};

// Logging the history of actions
const logHistory = (action: string, userId: string, data: any) => {
  return {
    action,
    userId,
    timestamp: new Date().toISOString(),
    details: data,
  };
};

// GET: Retrieve all participators
export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const decoded: any = verifyToken(token);
    const userId = String(decoded.userId);

    const participators = await prisma.participator.findMany({
      where: { createdBy: userId },
    });

    if (!participators.length) {
      return NextResponse.json({ error: 'No participator records found' }, { status: 404 });
    }

    return NextResponse.json(participators, { status: 200 });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
