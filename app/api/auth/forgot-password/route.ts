import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/email';
import { saveResetToken } from '@/lib/google-sheets-db'; // New function we need to add
import { rateLimit, generalLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Rate Limiting
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        const { success } = await rateLimit(ip, generalLimiter);
        if (!success) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
        }

        // Generate 4-digit PIN
        const resetPin = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

        // TODO: Save to database/sheet
        // For now, we'll implement a mock function or specific sheet function
        try {
            await saveResetToken(email, resetPin, expiresAt);
        } catch (dbError) {
            console.error('Failed to save reset token:', dbError);
            // In MVP, we might fail here. 
            // If we can't save the token, the user can't verify it.
            return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 });
        }

        // Send Email
        const emailResult = await sendPasswordResetEmail(email, resetPin);

        if (!emailResult.success) {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Reset PIN sent',
            // debug: resetPin // REMOVE IN PRODUCTION
        });

    } catch (error) {
        console.error('Forgot password API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
