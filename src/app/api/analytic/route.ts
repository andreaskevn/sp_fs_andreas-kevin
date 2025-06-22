import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { TaskStatus } from "@/generated/prisma/client";

/**
 * @method  GET
 * @desc   
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
      select: {
        id: true,
        name: true,
      },
    });

    if (projects.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

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
