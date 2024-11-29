import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma'; // Ensure Prisma client is properly set up
import { z } from 'zod';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Define the custom type for JWT payload
interface DecodedToken extends JwtPayload {
  email: string;
}

// Zod schemas for validating the request body
const selectLandParticipatorSchema = z.object({
  landId: z.number(),
  participatorId: z.number(),
});

const updateLandParticipatorSchema = z.object({
  id: z.number(),
  landId: z.number(),
  participatorId: z.number(),
});

// Helper function to verify the JWT token
const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as DecodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// ========================= GET =========================
// Fetch all land participators
export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]; // 'Bearer token'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const landParticipators = await prisma.landParticipator.findMany({
      select: {
        id: true,
        landId: true,
        participatorId: true,
        createdAt: true,
        updatedAt: true,
        createdBy: true,
        updatedBy: true,
        history: true,
      },
    });

    return NextResponse.json(landParticipators);
  } catch (error) {
    console.error('Error fetching land participators:', error);
    return NextResponse.json(
      { error: 'Failed to fetch land participators' },
      { status: 500 }
    );
  }
}

// ========================= POST =========================
// Add a new land-participator association
export async function POST(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]; // 'Bearer token'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = selectLandParticipatorSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { landId, participatorId } = parsedData.data;

    // Validate Land and Participator existence
    const land = await prisma.land.findUnique({ where: { id: landId } });
    const participator = await prisma.user.findUnique({ where: { id: participatorId } });

    if (!land || !participator) {
      return NextResponse.json(
        { error: 'Land or participator not found' },
        { status: 404 }
      );
    }

    // Create new association
    const newAssociation = await prisma.landParticipator.create({
      data: {
        landId,
        participatorId,
        createdBy: user.email || 'system',  // Now user has `email`
      },
    });

    return NextResponse.json(newAssociation);
  } catch (error) {
    // Explicitly type `error` as `Error`
    if (error instanceof Error) {
      console.error('Error creating association:', error);
      return NextResponse.json(
        { error: 'Failed to create land-participator association', details: error.message },
        { status: 500 }
      );
    }
    console.error('Unknown error:', error);
    return NextResponse.json(
      { error: 'Failed to create land-participator association' },
      { status: 500 }
    );
  }
}

// ========================= PUT =========================
// Update an existing land-participator association
export async function PUT(req: Request) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1]; // 'Bearer token'

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const body = await req.json();
    const parsedData = updateLandParticipatorSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsedData.error.issues },
        { status: 400 }
      );
    }

    const { id, landId, participatorId } = parsedData.data;

    // Check if the association exists
    const existingAssociation = await prisma.landParticipator.findUnique({
      where: { id },
    });

    if (!existingAssociation) {
      return NextResponse.json({ error: 'Association not found' }, { status: 404 });
    }

    // Validate Land and Participator existence
    const land = await prisma.land.findUnique({ where: { id: landId } });
    const participator = await prisma.user.findUnique({ where: { id: participatorId } });

    if (!land || !participator) {
      return NextResponse.json(
        { error: 'Land or participator not found' },
        { status: 404 }
      );
    }

    // Update the association
    const updatedAssociation = await prisma.landParticipator.update({
      where: { id },
      data: {
        landId,
        participatorId,
        updatedBy: user.email || 'system',  // Now user has `email`
      },
    });

    return NextResponse.json(updatedAssociation);
  } catch (error) {
    // Explicitly type `error` as `Error`
    if (error instanceof Error) {
      console.error('Error updating association:', error);
      return NextResponse.json(
        { error: 'Failed to update land-participator association', details: error.message },
        { status: 500 }
      );
    }
    console.error('Unknown error:', error);
    return NextResponse.json(
      { error: 'Failed to update land-participator association' },
      { status: 500 }
    );
  }
}
