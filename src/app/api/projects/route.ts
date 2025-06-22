// app/api/projects/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

/**
 * @method  GET
 * @desc    
 * 
 */
export async function GET(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: auth.userId,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, email: true },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error("GET_PROJECTS_ERROR", error);
    return NextResponse.json(
      { error: "Gagal mengambil data project" },
      { status: 500 }
    );
  }
}

/**
 * @method  POST
 * @desc    
 */
export async function POST(request: NextRequest) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nama project dibutuhkan" },
        { status: 400 }
      );
    }

    const newProject = await prisma.project.create({
      data: {
        name,
        ownerId: auth.userId,
        members: {
          create: [
            {
              userId: auth.userId,
              role: "OWNER",
            },
          ],
        },
      },
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("CREATE_PROJECT_ERROR", error);
    return NextResponse.json(
      { error: "Gagal membuat project" },
      { status: 500 }
    );
  }
}
