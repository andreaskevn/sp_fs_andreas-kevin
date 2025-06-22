// app/api/analytics/route.ts

import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { TaskStatus } from "@prisma/client";

/**
 * @method  GET
 * @desc    Mendapatkan data analitik task agregat untuk SEMUA project milik user.
 */
export async function GET(request: NextRequest) {
  // 1. Otentikasi
  const auth = verifyAuth(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Ambil semua project di mana user adalah anggota
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: auth.userId,
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Jika tidak ada proyek, kembalikan array kosong
    if (projects.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 3. Untuk setiap project, hitung jumlah task berdasarkan statusnya
    // Promise.all digunakan agar semua query berjalan secara paralel untuk efisiensi
    const analyticsData = await Promise.all(
      projects.map(async (project) => {
        const taskCounts = await prisma.task.groupBy({
          by: ["status"],
          where: {
            projectId: project.id,
          },
          _count: {
            status: true,
          },
        });

        // 4. Format data agar mudah digunakan di frontend
        const counts = {
          BACKLOG: 0,
          TODO: 0,
          IN_PROGRESS: 0,
          DONE: 0,
        };

        taskCounts.forEach((group) => {
          if (group.status in counts) {
            counts[group.status as TaskStatus] = group._count.status;
          }
        });

        return {
          projectId: project.id,
          projectName: project.name,
          taskCounts: counts,
        };
      })
    );

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error("GET_ANALYTICS_ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data analitik" },
      { status: 500 }
    );
  }
}
