import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

async function isOwner(userId: string, projectId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });
  return !!project;
}

/**
 * @method GET
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = verifyAuth(request);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = auth;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        owner: {
          select: { id: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, email: true },
            },
          },
        },
        tasks: {
          orderBy: {
            order: "asc",
          },
          include: {
            assignee: {
              select: {
                id: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error(`GET_PROJECT_DETAIL_ERROR for project ${projectId}:`, error);
    return NextResponse.json(
      { error: "Gagal mengambil detail project" },
      { status: 500 }
    );
  }
}

/**
 * @method PATCH
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = verifyAuth(request);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = auth;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    if (!(await isOwner(userId, projectId))) {
      return NextResponse.json(
        { error: "Hanya pemilik yang bisa mengupdate project" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Nama project dibutuhkan" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedProject, { status: 200 });
  } catch (error) {
    console.error(`UPDATE_PROJECT_ERROR for project ${projectId}:`, error);
    return NextResponse.json(
      { error: "Gagal mengupdate project" },
      { status: 500 }
    );
  }
}

/**
 * @method DELETE
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const auth = verifyAuth(request);

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = auth;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan atau akses ditolak" },
        { status: 404 }
      );
    }

    if (!(await isOwner(userId, projectId))) {
      return NextResponse.json(
        { error: "Hanya pemilik yang bisa menghapus project" },
        { status: 403 }
      );
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`DELETE_PROJECT_ERROR for project ${projectId}:`, error);
    return NextResponse.json(
      { error: "Gagal menghapus project" },
      { status: 500 }
    );
  }
}
