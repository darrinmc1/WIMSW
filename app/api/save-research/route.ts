import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { saveResearchHistory } from '@/lib/db';
import { rateLimit, getClientIdentifier, generalLimiter } from '@/lib/rate-limit';

export async function POST(request: Request) {
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

        const researchData = await request.json();

        // Destructure expected fields
        const {
            itemName,
            brand,
            category,
            condition,
            size,
            estimatedPrice,
            averagePrice,
            lowestPrice,
            highestPrice,
            results,
            isLocalOnly = false,
        } = researchData;

        // Validate required fields
        if (!itemName || !brand || !category || !condition) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Save to database using abstraction layer
        await saveResearchHistory(
            session.user.id,
            {
                name: itemName,
                brand,
                category,
                condition,
                size,
                estimatedPrice: averagePrice || estimatedPrice || 0,
            },
            {
                estimatedPrice,
                averagePrice,
                lowestPrice,
                highestPrice,
                ...results,
            },
            isLocalOnly
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Save Research error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to save research' },
            { status: 500 }
        );
    }
}
