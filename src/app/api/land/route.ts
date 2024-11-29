import { NextResponse } from 'next/server';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Logging the history of actions
const logHistory = (action: string, userId: string, data: any) => {
  return {
    action,
    userId,
    timestamp: new Date().toISOString(),
    details: {
      ...data,
      polygons: data.polygons, // Ensure polygons are included in the history log
    },
  };
};

// GET - Retrieve all land records for the authenticated user
export async function GET(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);

    // Ensure `userId` is treated as a string
    const userId = String(decoded.userId);
    
    const lands = await prisma.land.findMany({
      where: { createdBy: userId }, // Ensure userId is string
    });

    if (!lands.length) {
      return NextResponse.json({ error: 'No land records found' }, { status: 404 });
    }

    // Return the lands with the polygons correctly included
    return NextResponse.json(lands, { status: 200 });
  } catch (error) {
    console.error('JWT verification error:', error);
    return NextResponse.json({ error: 'Unauthorized', details: error.message }, { status: 401 });
  }
}

// POST - Create a new land entry
export async function POST(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const data = await req.json();

    // Ensure the polygons are an array of coordinates
    const polygons = Array.isArray(data.polygons)
      ? data.polygons
      : [];  // Default to an empty array if no polygons are provided

    const userId = String(decoded.userId);

    // Create new land entry
    const newLand = await prisma.land.create({
      data: {
        name: data.name,
        location: data.location,
        size: data.size,
        owner: data.owner,
        landType: data.landType,
        marketValue: data.marketValue,
        notes: data.notes,
        polygons, // Ensure this is handled as JSON
        createdBy: userId,
        updatedBy: userId,
        history: {
          create: logHistory('create', userId, data),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Return the newly created land with the ID
    return NextResponse.json({ id: newLand.id }, { status: 201 });
  } catch (error) {
    console.error('Creation error:', error.message);
    return NextResponse.json({ error: 'Error creating land', details: error.message }, { status: 500 });
  }
}

// PUT - Update an existing land entry
export async function PUT(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const data = await req.json();

    // Ensure the ID is provided
    if (!data.id) {
      return NextResponse.json({ error: 'Land ID is required' }, { status: 400 });
    }

    const land = await prisma.land.findUnique({
      where: { id: data.id, createdBy: decoded.userId },
    });

    if (!land) {
      return NextResponse.json({ error: 'Land record not found' }, { status: 404 });
    }

    // Ensure polygons are correctly passed as JSON array
    const polygons = Array.isArray(data.polygons) ? data.polygons : [];

    const updatedLand = await prisma.land.update({
      where: { id: data.id },
      data: {
        name: data.name,
        location: data.location,
        size: data.size,
        owner: data.owner,
        landType: data.landType,
        marketValue: data.marketValue,
        notes: data.notes,
        polygons, // Ensure this is handled as JSON
        updatedBy: decoded.userId,
        history: {
          push: logHistory('update', decoded.userId, data),
        },
      },
    });

    return NextResponse.json(updatedLand, { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Error updating land', details: error.message }, { status: 500 });
  }
}

// DELETE - Delete a land entry
export async function DELETE(req: Request) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Land ID is required' }, { status: 400 });
    }

    const land = await prisma.land.findUnique({
      where: { id, createdBy: decoded.userId },
    });

    if (!land) {
      return NextResponse.json({ error: 'Land record not found' }, { status: 404 });
    }

    await prisma.land.update({
      where: { id },
      data: {
        history: {
          push: logHistory('delete', decoded.userId, land),
        },
      },
    });

    await prisma.land.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Land record deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Error deleting land', details: error.message }, { status: 500 });
  }
}
