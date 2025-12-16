
import { NextResponse } from "next/server";
import { getUserByEmail, updatePassword } from "@/lib/google-sheets-db";
import { sendPasswordResetEmail } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        // 1. Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return NextResponse.json({
                success: true,
                message: "If an account exists, a reset PIN has been sent."
            });
        }

        // 2. Generate a random 4-digit PIN
        const tempPin = Math.floor(1000 + Math.random() * 9000).toString();

        // 3. Hash the PIN
        const hashedPin = await bcrypt.hash(tempPin, 10);

        // 4. Update the user's password (PIN) in the database immediately
        // Ideally we would use a separate "reset token" field, but for this PIN-based system,
        // setting a temporary PIN is acceptable as it allows immediate login.
        const updated = await updatePassword(email, hashedPin);

        if (!updated) {
            throw new Error("Failed to update PIN in database");
        }

        // 5. Send the email via Resend
        const emailResult = await sendPasswordResetEmail({
            email,
            pin: tempPin,
        });

        if (!emailResult.success) {
            throw new Error("Failed to send email");
        }

        return NextResponse.json({
            success: true,
            message: "If an account exists, a reset PIN has been sent."
        });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json(
            { success: false, error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
