
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserByEmail, updatePassword } from '@/lib/google-sheets-db';
import { compare, hash } from 'bcryptjs';
import { rateLimit, generalLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Rate Limit
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const { success } = await rateLimit(ip, generalLimiter);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: 'New password too short' }, { status: 400 });
        }

        // Verify current password
        const user = await getUserByEmail(session.user.email);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isValid = await compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await hash(newPassword, 12);

        // Update
        const updated = await updatePassword(session.user.email, hashedPassword);
        if (!updated) {
            return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error('Change password API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
