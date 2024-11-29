import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
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

// GET - Retrieve a single participator record by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const participatorId = parseInt(params.id); // Convert ID to integer

    // Retrieve participator by ID and ensure it belongs to the current user
    const participator = await prisma.landParticipator.findUnique({
      where: {
        id: participatorId,
        createdBy: String(decoded.userId),
      },
    });

    if (!participator) {
      return NextResponse.json({ error: 'Participator record not found or unauthorized' }, { status: 404 });
    }

    // Return the participator record
    return NextResponse.json(participator, { status: 200 });
  } catch (error) {
    console.error('GET error:', error.message);
    return NextResponse.json({ error: 'Unauthorized: Invalid token or token expired', details: error.message }, { status: 401 });
  }
}

// PUT - Update an existing participator record by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const data = await req.json();
    const participatorId = parseInt(params.id); // Convert ID to integer

    if (!data) {
      return NextResponse.json({ error: 'Invalid data received' }, { status: 400 });
    }

    // Check if the participator exists and is associated with the current user
    const participator = await prisma.landParticipator.findUnique({
      where: {
        id: participatorId,
        createdBy: String(decoded.userId),
      },
    });

    if (!participator) {
      return NextResponse.json({ error: 'Participator record not found or unauthorized' }, { status: 404 });
    }

    // Update the participator record
    const updatedParticipator = await prisma.landParticipator.update({
      where: { id: participatorId },
      data: {
        participatorId: data.participatorId || participator.participatorId,
        updatedBy: String(decoded.userId),
        history: {
          push: logHistory('update', String(decoded.userId), data),
        },
      },
    });

    // Return the updated participator record
    return NextResponse.json(updatedParticipator, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error.message);
    return NextResponse.json({ error: 'Error updating participator', details: error.message }, { status: 500 });
  }
}

// DELETE - Delete a participator record by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const participatorId = parseInt(params.id); // Convert ID to integer

    // Check if the participator exists and is associated with the current user
    const participator = await prisma.landParticipator.findUnique({
      where: {
        id: participatorId,
        createdBy: String(decoded.userId),
      },
    });

    if (!participator) {
      return NextResponse.json({ error: 'Participator record not found or unauthorized' }, { status: 404 });
    }

    // Log the deletion action
    await prisma.landParticipator.update({
      where: { id: participatorId },
      data: {
        history: {
          push: logHistory('delete', String(decoded.userId), participator),
        },
      },
    });

    // Delete the participator record
    await prisma.landParticipator.delete({
      where: { id: participatorId },
    });

    // Return success message
    return NextResponse.json({ message: 'Participator record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error.message);
    return NextResponse.json({ error: 'Error deleting participator', details: error.message }, { status: 500 });
  }
}
