// app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import type { LoginApiResponse, UserSafeData } from "@/lib/definition";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      const response: LoginApiResponse = {
        error: "Email dan password dibutuhkan",
      };
      return NextResponse.json(response, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const response: LoginApiResponse = { error: "Email ini sudah terdaftar" };
      return NextResponse.json(response, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    const userSafeData: UserSafeData = {
      id: user.id,
      email: user.email,
    };

    const response: LoginApiResponse = {
      message: "Registrasi berhasil!",
      user: userSafeData,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    const response: LoginApiResponse = {
      error: "Terjadi kesalahan pada server",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
