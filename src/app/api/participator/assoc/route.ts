// app/api/land-participator/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
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

// GET: Retrieve all land participators
export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const decoded: any = verifyToken(token);
    const userId = String(decoded.userId);

    const landParticipators = await prisma.landParticipator.findMany({
      where: { createdBy: userId },
    });

    if (!landParticipators.length) {
      return NextResponse.json({ error: 'No land participator records found' }, { status: 404 });
    }

    return NextResponse.json(landParticipators, { status: 200 });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// POST: Create a new land participator
export async function POST(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const decoded: any = verifyToken(token);
    const userId = String(decoded.userId);

    const body = await req.json();

    // Assuming validation and sanitization is done before this step
    const newLandParticipator = await prisma.landParticipator.create({
      data: {
        ...body,
        createdBy: userId,
        updatedBy: userId,
        history: logHistory('Created new land participator', userId, body),
      },
    });

    return NextResponse.json(newLandParticipator, { status: 201 });
  } catch (error) {
    console.error('JWT verification or data processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// PUT: Update an existing land participator
export async function PUT(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const decoded: any = verifyToken(token);
    const userId = String(decoded.userId);

    const body = await req.json();
    const { id, ...updatedData } = body;

    const updatedLandParticipator = await prisma.landParticipator.update({
      where: { id },
      data: {
        ...updatedData,
        updatedBy: userId,
        history: logHistory('Updated land participator', userId, updatedData),
      },
    });

    return NextResponse.json(updatedLandParticipator, { status: 200 });
  } catch (error) {
    console.error('JWT verification or data processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// DELETE: Delete a land participator
export async function DELETE(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  try {
    const decoded: any = verifyToken(token);
    const userId = String(decoded.userId);

    const { id } = await req.json();

    const deletedLandParticipator = await prisma.landParticipator.delete({
      where: { id },
    });

    // Log the history of the deletion
    const historyData = logHistory('Deleted land participator', userId, deletedLandParticipator);

    return NextResponse.json(deletedLandParticipator, { status: 200 });
  } catch (error) {
    console.error('JWT verification or data processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
