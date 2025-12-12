import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest } from '@/lib/validations';
import { rateLimit, getClientIdentifier, generalLimiter } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { USE_POSTGRES } from '@/lib/db';

const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    source: z.string().optional(),
});

export async function POST(request: Request) {
    try {
        // Rate limiting: 30 requests per minute (prevent spam)
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

        const body = await request.json();

        // Validate request
        const validation = validateRequest(signupSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { email, source } = validation.data;

        // Save to database if PostgreSQL is configured
        if (USE_POSTGRES) {
            await prisma.interestSignup.create({
                data: {
                    email,
                    source: source || 'website',
                },
            });
        } else {
            // Fallback: Just log (in production, send to CRM)
            console.log('Interest Signup:', { email, source });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Signup Interest error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process signup' },
            { status: 500 }
        );
    }
}
