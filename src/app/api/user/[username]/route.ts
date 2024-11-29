// app/users/[username]/route.ts

import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma'; // Adjust the path as needed
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// GET: Retrieve user details by username
export async function GET(req: Request, { params }: { params: { username: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET); // Verify the JWT token

    const { username } = params;

    // Retrieve user data from the database
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        occupation: true,
        avatar: true,
        email: true,
        age: true,
        address: true,
        facebook: true,
        twitter: true,
        linkedIn: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error retrieving user:', error);
    return NextResponse.json({ error: 'Error retrieving user' }, { status: 500 });
  }
}

// POST: Follow a user by username
export async function POST(req: Request, { params }: { params: { username: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const currentUserId = Number(decoded.userId);
    const { username } = params;

    // Find the user to follow
    const userToFollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToFollow || currentUserId === userToFollow.id) {
      return NextResponse.json({ error: 'User not found or invalid action' }, { status: 400 });
    }

    // Create a follow connection
    const connection = await prisma.connection.create({
      data: {
        follower: currentUserId,
        folowed: userToFollow.id,
      },
    });

    return NextResponse.json({ message: 'Successfully followed user', connection }, { status: 201 });
  } catch (error) {
    console.error('Error following user:', error);
    return NextResponse.json({ error: 'Error following user' }, { status: 500 });
  }
}

// DELETE: Unfollow a user by username
export async function DELETE(req: Request, { params }: { params: { username: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const currentUserId = Number(decoded.userId);
    const { username } = params;

    // Find the user to unfollow
    const userToUnfollow = await prisma.user.findUnique({
      where: { username },
    });

    if (!userToUnfollow) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the connection exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        follower: currentUserId,
        folowed: userToUnfollow.id,
      },
    });

    if (!existingConnection) {
      return NextResponse.json({ error: 'Connection does not exist' }, { status: 404 });
    }

    // Delete the connection
    await prisma.connection.delete({
      where: { id: existingConnection.id },
    });

    return NextResponse.json({ message: 'Successfully unfollowed user' }, { status: 200 });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    return NextResponse.json({ error: 'Error unfollowing user' }, { status: 500 });
  }
}
