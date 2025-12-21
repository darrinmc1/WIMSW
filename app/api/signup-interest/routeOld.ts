import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        // Here you would normally save to DB/CRM
        console.log('Signup Interest:', body)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to process' }, { status: 500 })
    }
}
