import { NextResponse } from 'next/server';
import { verifyResetToken, updatePassword } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, pin, newPassword } = body;

        if (!email || !pin || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Verify PIN
        const isValid = await verifyResetToken(email, pin);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid or expired PIN' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 12);

        // Update password in DB
        const updated = await updatePassword(email, hashedPassword);
        if (!updated) {
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        // Clear reset token (optional but good practice)
        // We can just set it to empty or expired in future, for now we rely on expiry

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Reset password API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
