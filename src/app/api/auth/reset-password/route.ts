import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { ResetPasswordSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ResetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email, code, newPassword } = parsed.data;

    const token = await prisma.verificationToken.findFirst({
      where: {
        identifier: `reset:${email}`,
        token: code,
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    if (new Date() > token.expires) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: token.identifier,
            token: token.token,
          },
        },
      });
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: token.identifier,
          token: token.token,
        },
      },
    });

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
