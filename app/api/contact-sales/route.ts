import { NextResponse } from 'next/server';
import { z } from 'zod';
import { validateRequest } from '@/lib/validations';
import { rateLimit, getClientIdentifier, generalLimiter } from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';
import { USE_POSTGRES } from '@/lib/db';

const contactSalesSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    message: z.string().min(10, 'Message must be at least 10 characters'),
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
        const validation = validateRequest(contactSalesSchema, body);
        if (!validation.success) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 400 }
            );
        }

        const { name, email, company, message } = validation.data;

        // Save to database if PostgreSQL is configured
        if (USE_POSTGRES) {
            await prisma.contactRequest.create({
                data: {
                    name,
                    email,
                    company: company || null,
                    message,
                },
            });
        } else {
            // Fallback: Just log (in production, send email notification)
            console.log('Contact Sales Request:', { name, email, company, message });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Contact Sales error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to process request' },
            { status: 500 }
        );
    }
}
