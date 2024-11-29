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

// GET - Retrieve a single land record by ID
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const landId = parseInt(params.id); // Convert ID to integer

    // Retrieve land by ID and ensure it belongs to the current user
    const land = await prisma.land.findUnique({
      where: {
        id: landId,
        createdBy: String(decoded.userId),
      },
    });

    if (!land) {
      return NextResponse.json({ error: 'Land record not found or unauthorized' }, { status: 404 });
    }

    // Return the land record
    return NextResponse.json(land, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('GET error:', error.message);
      return NextResponse.json({ error: 'Unauthorized: Invalid token or token expired', details: error.message }, { status: 401 });
    } else {
      console.error('Unknown error occurred during GET:', error);
      return NextResponse.json({ error: 'Unknown error occurred', details: 'No error message available' }, { status: 500 });
    }
  }
}

// PUT - Update an existing land record by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const data = await req.json();
    const landId = parseInt(params.id); // Convert ID to integer

    if (!data) {
      return NextResponse.json({ error: 'Invalid data received' }, { status: 400 });
    }

    // Check if the land exists and is owned by the current user
    const land = await prisma.land.findUnique({
      where: {
        id: landId,
        createdBy: String(decoded.userId),
      },
    });

    if (!land) {
      return NextResponse.json({ error: 'Land record not found or unauthorized' }, { status: 404 });
    }

    // Update the land record
    const updatedLand = await prisma.land.update({
      where: { id: landId },
      data: {
        name: data.name || land.name,
        location: data.location || land.location,
        size: data.size || land.size,
        owner: data.owner || land.owner,
        landType: data.landType || land.landType,
        marketValue: data.marketValue || land.marketValue,
        notes: data.notes || land.notes,
        polygons: data.polygons || land.polygons, // Handle polygons as an array
        updatedBy: String(decoded.userId),
        history: {
          push: logHistory('update', String(decoded.userId), data),
        },
      },
    });

    // Return the updated land record
    return NextResponse.json(updatedLand, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('PUT error:', error.message);
      return NextResponse.json({ error: 'Error updating land', details: error.message }, { status: 500 });
    } else {
      console.error('Unknown error occurred during PUT:', error);
      return NextResponse.json({ error: 'Unknown error occurred', details: 'No error message available' }, { status: 500 });
    }
  }
}

// DELETE - Delete a land record by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const landId = parseInt(params.id); // Convert ID to integer

    // Check if the land exists and is owned by the current user
    const land = await prisma.land.findUnique({
      where: {
        id: landId,
        createdBy: String(decoded.userId),
      },
    });

    if (!land) {
      return NextResponse.json({ error: 'Land record not found or unauthorized' }, { status: 404 });
    }

    // Log the deletion action
    await prisma.land.update({
      where: { id: landId },
      data: {
        history: {
          push: logHistory('delete', String(decoded.userId), land),
        },
      },
    });

    // Delete the land record
    await prisma.land.delete({
      where: { id: landId },
    });

    // Return success message
    return NextResponse.json({ message: 'Land record deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('DELETE error:', error.message);
      return NextResponse.json({ error: 'Error deleting land', details: error.message }, { status: 500 });
    } else {
      console.error('Unknown error occurred during DELETE:', error);
      return NextResponse.json({ error: 'Unknown error occurred', details: 'No error message available' }, { status: 500 });
    }
  }
}
