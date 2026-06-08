import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const email = session.user.email;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (existingUser.emailVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: `verify:${email}` },
    });

    const otp = generateOTP();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: `verify:${email}`,
        token: otp,
        expires,
      },
    });

    try {
      await sendEmail({
        to: email,
        subject: "Mapody - Email Verification Code",
        text: `Your email verification code is: ${otp}\n\nThis code expires in 15 minutes.`,
        html: `<p>Your email verification code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json({
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Request verification error:", error);
    return NextResponse.json(
      { error: "Failed to send verification code" },
      { status: 500 }
    );
  }
}
