import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getResearchHistory } from '@/lib/db';
import { rateLimit, getClientIdentifier, generalLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        // Authentication required
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Rate limiting: 30 requests per minute
        const identifier = getClientIdentifier(request);
        const rateLimitResult = await rateLimit(identifier, generalLimiter);

        if (!rateLimitResult.success) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'X-RateLimit-Limit': String(rateLimitResult.limit),
                        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
                        'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                    }
                }
            );
        }

        // Get optional limit from query params
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');

        // Fetch research history using database abstraction
        const data = await getResearchHistory(session.user.id, limit);

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Get Research History error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch history' },
            { status: 500 }
        );
    }
}
