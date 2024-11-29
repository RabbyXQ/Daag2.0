// app/api/users/[username]/follow/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma'; // Adjust the path as needed
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// POST: Follow a user
export async function POST(req: Request, { params }: { params: { username: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const followerId = (decoded as any).id; // Assuming the JWT contains the user's id
    const { username } = params;

    const userToFollow = await prisma.user.findUnique({ where: { username } });
    if (!userToFollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create a follow connection
    await prisma.connection.create({
      data: {
        follower: followerId,
        folowed: userToFollow.id,
      },
    });

    return NextResponse.json({ message: 'Followed successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Error following user' }, { status: 500 });
  }
}


// app/api/users/[username]/follow/route.ts

// Add this to the existing follow route file

// DELETE: Unfollow a user
export async function DELETE(req: Request, { params }: { params: { username: string } }) {
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }
  
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const followerId = (decoded as any).id; // Assuming the JWT contains the user's id
      const { username } = params;
  
      const userToUnfollow = await prisma.user.findUnique({ where: { username } });
      if (!userToUnfollow) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
  
      // Delete the follow connection
      await prisma.connection.deleteMany({
        where: {
          follower: followerId,
          folowed: userToUnfollow.id,
        },
      });
  
      return NextResponse.json({ message: 'Unfollowed successfully' }, { status: 200 });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return NextResponse.json({ error: 'Error unfollowing user' }, { status: 500 });
    }
  }
  