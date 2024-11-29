import { NextResponse } from 'next/server';
import prisma from '../lib/prisma'; // Adjust the import path for your Prisma client
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Logging the history of actions
const logHistory = (action: string, userId: string, data: any) => {
  return {
    action,
    userId,
    timestamp: new Date().toISOString(),
    details: data,
  };
};

// GET: Retrieve all users
export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = String(decoded.userId);

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    // Get friend suggestions if action is 'suggestions'
    if (action === 'suggestions') {
      return await getFriendSuggestions(userId);
    }

    // Otherwise, retrieve all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        occupation: true,
      },
    });

    if (!users.length) {
      return NextResponse.json({ error: 'No users found' }, { status: 404 });
    }

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ error: 'Unauthorized', details: error.message }, { status: 401 });
  }
}

// Function to fetch friend suggestions excluding followed users
async function getFriendSuggestions(userId: string) {
  try {
    const followedIds = await prisma.connection.findMany({
      where: { follower: parseInt(userId) },
      select: { folowed: true },
    });

    const excludedIds = followedIds.map(connection => connection.folowed);

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: [...excludedIds, parseInt(userId)] }, // Exclude followed and self
        occupation: { not: null },
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        occupation: true,
      },
      take: 10, // Limit to 10 suggestions
    });

    // Log the action for suggestion retrieval
    await prisma.history.create({
      data: logHistory('suggestions', userId, suggestions),
    });

    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.error('Error fetching friend suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch friend suggestions' }, { status: 500 });
  }
}
