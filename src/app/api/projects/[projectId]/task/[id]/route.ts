// app/api/projects/[projectId]/task/[id]/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

interface RouteContext {
  params: {
    projectId: string;
    id: string;
  };
}

async function authorizeUserForTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      project: {
        members: {
          some: { userId: userId },
        },
      },
    },
  });
  return task;
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { projectId, id: taskId } = params;

  const auth = verifyAuth(request);
  if (!auth)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const taskToUpdate = await authorizeUserForTask(auth.userId, taskId);
    if (!taskToUpdate || taskToUpdate.projectId !== projectId) {
      return NextResponse.json(
        { error: "Task tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, status, order, assigneeId } = body;

    let updatedTask;

    if (status !== undefined && order !== undefined) {
      updatedTask = await prisma.$transaction(async (tx) => {
        if (taskToUpdate.status !== status) {
          await tx.task.updateMany({
            where: {
              projectId: projectId,
              status: taskToUpdate.status,
              order: { gt: taskToUpdate.order },
            },
            data: { order: { decrement: 1 } },
          });

          await tx.task.updateMany({
            where: {
              projectId: projectId,
              status: status,
              order: { gte: order },
            },
            data: { order: { increment: 1 } },
          });
        } else {
          if (taskToUpdate.order < order) {
            await tx.task.updateMany({
              where: {
                projectId: projectId,
                status: status,
                order: { gt: taskToUpdate.order, lte: order },
              },
              data: { order: { decrement: 1 } },
            });
          } else {
            await tx.task.updateMany({
              where: {
                projectId: projectId,
                status: status,
                order: { gte: order, lt: taskToUpdate.order },
              },
              data: { order: { increment: 1 } },
            });
          }
        }

        return tx.task.update({
          where: { id: taskId },
          data: { status, order },
        });
      });
    } else {
      updatedTask = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title,
          description: description,
          assigneeId: assigneeId,
        },
      });
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("UPDATE_TASK_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate task" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const { projectId, id: taskId } = params;

  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const taskToDelete = await authorizeUserForTask(auth.userId, taskId);
    if (!taskToDelete || taskToDelete.projectId !== projectId) {
      return NextResponse.json(
        { error: "Task tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.task.delete({ where: { id: taskId } });

      await tx.task.updateMany({
        where: {
          projectId: taskToDelete.projectId,
          status: taskToDelete.status,
          order: { gt: taskToDelete.order },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_TASK_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal menghapus task" },
      { status: 500 }
    );
  }
}
