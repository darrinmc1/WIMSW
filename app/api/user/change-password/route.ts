import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getUserByEmail, updatePassword } from "@/lib/db";
import bcrypt from "bcryptjs";
import { analyzeItemLimiter, getClientIdentifier, rateLimit } from "@/lib/rate-limit";
import { changePasswordSchema, validateRequest } from "@/lib/validations";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Rate Limiting (Protection against brute force)
        const identifier = getClientIdentifier(req);
        const { success: limitSuccess, remaining, resetTime } = await rateLimit(identifier, analyzeItemLimiter);

        if (!limitSuccess) {
            return NextResponse.json(
                { error: "Too many requests. Please try again later." },
                {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": analyzeItemLimiter.limit.toString(), // Note: accessing private prop if needed, or hardcode
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": resetTime.toString(),
                    },
                }
            );
        }

        const body = await req.json();

        // 2. Input Validation (Zod)
        const validation = validateRequest(changePasswordSchema, body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }

        const { currentPassword, newPassword } = validation.data;

        // Get user to verify current password
        const user = await getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return NextResponse.json(
                { error: "Incorrect current password" },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        const success = await updatePassword(session.user.email, hashedPassword);

        if (!success) {
            throw new Error("Failed to update password in database");
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Password update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
