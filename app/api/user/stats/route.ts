import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getResearchHistory } from '@/lib/db';
import { rateLimit, getClientIdentifier, generalLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const identifier = getClientIdentifier(request);
        const rateLimitResult = await rateLimit(identifier, generalLimiter);
        if (!rateLimitResult.success) {
            return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
        }

        // Fetch user history (limit to 1000 for stats calculation)
        const history = await getResearchHistory(session.user.id, 1000);

        const totalItems = history.length;
        const totalValue = history.reduce((sum: number, item: any) => sum + (Number(item.estimatedPrice) || 0), 0);

        return NextResponse.json({
            success: true,
            data: {
                totalItems,
                totalValue
            }
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        return NextResponse.json({ success: false, error: 'Internal Error' }, { status: 500 });
    }
}
