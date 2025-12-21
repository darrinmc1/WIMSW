import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminSettingsPage() {
    const spreadsheetID = process.env.GOOGLE_SHEET_ID;
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetID}`;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Database Management</CardTitle>
                    <CardDescription>
                        Direct access to the underlying data store.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        The application uses Google Sheets as its primary database. You can view raw data, manually edit records, or backup your data directly in Google Sheets.
                    </p>
                    <div className="flex gap-4">
                        <Link href={sheetUrl} target="_blank" rel="noopener noreferrer">
                            <Button>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Open Google Sheet
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium">Environment</span>
                        <span className="text-sm text-muted-foreground">{process.env.NODE_ENV}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-sm font-medium">Next.js Version</span>
                        <span className="text-sm text-muted-foreground">14+</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
