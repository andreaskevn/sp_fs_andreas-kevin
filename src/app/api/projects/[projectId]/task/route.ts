import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { TaskStatus } from "@/generated/prisma";

interface RouteContext {
  params: {
    projectId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;
  const { userId } = auth;

  try {
    const membership = await prisma.membership.findFirst({
      where: {
        projectId: projectId,
        userId: userId,
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Akses ditolak. Anda bukan anggota project ini." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, status, assigneeId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Judul task dibutuhkan" },
        { status: 400 }
      );
    }

    const taskCountInColumn = await prisma.task.count({
      where: {
        projectId: projectId,
        status: status || TaskStatus.TODO,
      },
    });

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || null,
        status: status || TaskStatus.TODO,
        order: taskCountInColumn,
        projectId: projectId,
        assigneeId: assigneeId || null,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(`CREATE_TASK_ERROR in project ${projectId}:`, error);
    return NextResponse.json(
      { error: "Gagal menambahkan task" },
      { status: 500 }
    );
  }
}
