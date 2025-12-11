
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
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

        // Read rows from "Research" sheet
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Research!A:H', // Fetch Columns A through H
        })

        const rows = response.data.values || []

        // Transform array of arrays into array of objects
        // Assuming first row MIGHT be headers, so we might want to skip it or handle it.
        // For simplicity, let's just return raw rows or simple mapping.
        // Let's assume user followed instructions: Date, Item Name, Brand, Est Price, Avg Market Price...

        // Map to object, maybe skipping header if it looks like a header
        // Simple heuristic: if first row date is "Date", skip it.

        let data = rows.map((row, index) => ({
            id: index,
            date: row[0],
            itemName: row[1],
            brand: row[2],
            category: row[3],
            estimatedPrice: row[4],
            averagePrice: row[5],
            priceRange: row[6],
            status: row[7]
        }))

        // Filter out header row if present
        if (data.length > 0 && data[0].date === 'Date') {
            data = data.slice(1)
        }

        // Sort by date descending (newest first)
        data.reverse()

        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error('Get Research History error:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 })
    }
}
