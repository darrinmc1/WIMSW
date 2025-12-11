
import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: Request) {
    try {
        const researchData = await request.json()

        // Destructure expected fields
        const {
            date,
            itemName,
            brand,
            category,
            estimatedPrice,
            averagePrice,
            lowestPrice,
            highestPrice,
            image // Optional, maybe a link if we uploaded it, but skipping for sheets for now unless short URL
        } = researchData

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

        // Append row to sheet "Research"
        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Research!A:H',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    date || new Date().toISOString(),
                    itemName || 'Unknown',
                    brand || 'N/A',
                    category || 'N/A',
                    estimatedPrice || 0,
                    averagePrice || 0,
                    `${lowestPrice || 0} - ${highestPrice || 0}`, // Price Range
                    'Saved' // Status
                ]]
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Save Research error:', error)
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
