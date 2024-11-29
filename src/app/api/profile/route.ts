// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId;

    const data = await req.json();

    let hashedPassword = data.pass;
    if (data.pass) {
      hashedPassword = await bcrypt.hash(data.pass, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        email: data.email,
        age: data.age,
        address: data.address,
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        dob: data.dob,
        occupation: data.occupation,
        avatar: data.avatar,
        facebook: data.facebook,
        twitter: data.twitter,
        linkedIn: data.linkedIn
      },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Error updating profile' }, { status: 500 });
  }
}
