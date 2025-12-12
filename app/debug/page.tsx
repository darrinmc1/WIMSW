import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { USE_POSTGRES } from "@/lib/db"

export default async function DebugPage() {
    const session = await getServerSession(authOptions)

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Debug Info</h1>

            <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">Database Connection</h2>
                <p>Mode: <strong>{USE_POSTGRES ? 'PostgreSQL' : 'Google Sheets'}</strong></p>
                <p className="text-sm text-gray-500 mt-1">
                    (Determined by presence of DATABASE_URL environment variable)
                </p>
            </div>

            <div className="p-4 border rounded bg-gray-50">
                <h2 className="font-bold mb-2">Current Session</h2>
                <pre className="bg-gray-900 text-white p-4 rounded overflow-auto">
                    {JSON.stringify(session, null, 2)}
                </pre>
            </div>

            <div className="p-4 border rounded bg-yellow-50 border-yellow-200">
                <h2 className="font-bold mb-2 text-yellow-800">Troubleshooting</h2>
                <ul className="list-disc pl-5 space-y-2 text-sm text-yellow-800">
                    <li>If Mode is <strong>PostgreSQL</strong> but you are editing Google Sheets, your changes won't work.</li>
                    <li>If Session Role is <strong>user</strong>, the app sees you as a standard user.</li>
                </ul>
            </div>
        </div>
    )
}
