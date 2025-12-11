import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: Request) {
    try {
        const { email, source } = await request.json()

        // Google Sheets setup
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })

        const sheets = google.sheets({ version: 'v4', auth })
        const spreadsheetId = process.env.GOOGLE_SHEET_ID

        // Append row to sheet
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Signups!A:D', // Sheet name: "Signups"
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    new Date().toISOString(),
                    email,
                    source,
                    'trial' // Default tier
                ]]
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Signup error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}