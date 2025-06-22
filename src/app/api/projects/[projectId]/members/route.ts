// app/api/projects/[projectId]/members/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

interface RouteContext {
  params: {
    projectId: string;
  };
}

async function isOwner(userId: string, projectId: string): Promise<boolean> {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
  });
  return !!project;
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = params;
  const { userId: currentUserId } = auth;

  try {
    if (!(await isOwner(currentUserId, projectId))) {
      return NextResponse.json(
        { error: "Hanya pemilik project yang dapat mengundang anggota." },
        { status: 403 }
      );
    }

    const { email: emailToInvite } = await request.json();
    if (!emailToInvite) {
      return NextResponse.json(
        { error: "Email anggota baru dibutuhkan" },
        { status: 400 }
      );
    }
    const userToInvite = await prisma.user.findUnique({
      where: { email: emailToInvite },
    });
    if (!userToInvite) {
      return NextResponse.json(
        { error: `User dengan email ${emailToInvite} tidak ditemukan` },
        { status: 404 }
      );
    }

    if (userToInvite.id === currentUserId) {
      return NextResponse.json(
        { error: "Anda tidak bisa mengundang diri sendiri." },
        { status: 400 }
      );
    }

    const existingMembership = await prisma.membership.findFirst({
      where: {
        projectId: projectId,
        userId: userToInvite.id,
      },
    });
    if (existingMembership) {
      return NextResponse.json(
        { error: "User ini sudah menjadi anggota project." },
        { status: 409 }
      ); 
    }

    const newMembership = await prisma.membership.create({
      data: {
        projectId: projectId,
        userId: userToInvite.id,
        role: "MEMBER", 
      },
      include: {
        user: {
          select: { id: true, email: true },
        },
      },
    });

    return NextResponse.json(newMembership, { status: 201 });
  } catch (error) {
    console.error("INVITE_MEMBER_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengundang anggota" },
      { status: 500 }
    );
  }
}
