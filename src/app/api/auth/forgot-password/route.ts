import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";
import { ForgotPasswordSchema } from "@/lib/validation";

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = ForgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: `reset:${email.toLowerCase().trim()}` },
      });

      const otp = generateOTP();
      const expires = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.verificationToken.create({
        data: {
          identifier: `reset:${email.toLowerCase().trim()}`,
          token: otp,
          expires,
        },
      });

      try {
        await sendEmail({
          to: email.toLowerCase().trim(),
          subject: "Mapody - Password Reset Code",
          text: `Your password reset code is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
          html: `<p>Your password reset code is: <strong>${otp}</strong></p><p>This code expires in 15 minutes.</p><p>If you didn't request this, please ignore this email.</p>`,
        });
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
      }
    }

    return NextResponse.json({
      message: "If an account exists with that email, a reset code has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
