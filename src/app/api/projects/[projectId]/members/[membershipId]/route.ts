import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  context: { params: { projectId: string; membershipId: string } }
) {
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, membershipId } = context.params;
  const { userId: currentUserId } = auth;

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project tidak ditemukan" },
        { status: 404 }
      );
    }

    const membershipToDelete = await prisma.membership.findUnique({
      where: { id: membershipId },
    });

    if (!membershipToDelete || membershipToDelete.projectId !== projectId) {
      return NextResponse.json(
        { error: "Keanggotaan tidak ditemukan di project ini" },
        { status: 404 }
      );
    }

    const isOwner = project.ownerId === currentUserId;
    const isSelf = membershipToDelete.userId === currentUserId;

    if (isOwner && isSelf) {
      return NextResponse.json(
        {
          error:
            "Pemilik tidak bisa keluar dari projectnya sendiri. Silakan transfer kepemilikan atau hapus project.",
        },
        { status: 400 }
      );
    }

    if (!isOwner && !isSelf) {
      return NextResponse.json(
        {
          error:
            "Hanya pemilik project atau anggota itu sendiri yang bisa melakukan aksi ini.",
        },
        { status: 403 }
      );
    }

    await prisma.membership.delete({
      where: { id: membershipId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE_MEMBER_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal menghapus anggota" },
      { status: 500 }
    );
  }
}
