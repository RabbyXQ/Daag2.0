import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/uploads/avatar");

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get("avatar") as File;
    const userId = formData.get("userId"); // Ensure userId is retrieved and is an integer

    if (!file || typeof userId !== 'string') {
      return NextResponse.json({ success: false, message: "Missing file or user ID" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const filePath = path.resolve(UPLOAD_DIR, file.name);
    fs.writeFileSync(filePath, buffer);

    // Convert userId to integer if your ID field is an integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ success: false, message: "Invalid user ID" }, { status: 400 });
    }

    // Update the user's profile with the new avatar
    await prisma.user.update({
      where: { id: userIdInt },
      data: { avatar: "/uploads/avatar/"+file.name },
    });

    return NextResponse.json({
      success: true,
      avatarUrl: file.name, // Adjust to return the file name or URL as needed
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};
