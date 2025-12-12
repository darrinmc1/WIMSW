import { getAllUsers } from "@/lib/google-sheets-db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, CreditCard, DollarSign } from "lucide-react";

export default async function AdminDashboard() {
    const users = await getAllUsers();

    const totalUsers = users.length;
    // Calculate new users today (not strictly possible with just date string, but checking if created today)
    // Assuming createdAt is ISO string
    const today = new Date().toISOString().split('T')[0];
    const newUsersToday = users.filter(user => user.createdAt.startsWith(today)).length;

    const paidUsers = users.filter(user => user.plan !== 'free').length;
    const totalRevenue = paidUsers * 19; // Assuming $19/mo avg

    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalUsers}</div>
                        <p className="text-xs text-muted-foreground">+0% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newUsersToday}</div>
                        <p className="text-xs text-muted-foreground">Joined today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{paidUsers}</div>
                        <p className="text-xs text-muted-foreground">Paying members</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estimated Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalRevenue}</div>
                        <p className="text-xs text-muted-foreground">Monthly Recurring</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    {/* Placeholder for chart */}
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
                        Revenue Chart Placeholder
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
