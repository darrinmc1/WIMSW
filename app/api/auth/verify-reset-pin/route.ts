import { NextResponse } from 'next/server';
import { verifyResetToken } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, pin } = body;

        if (!email || !pin) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const isValid = await verifyResetToken(email, pin);

        if (isValid) {
            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json({ error: 'Invalid or expired PIN' }, { status: 400 });
        }

    } catch (error) {
        console.error('Verify PIN API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
