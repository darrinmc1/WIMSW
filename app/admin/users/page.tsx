import { getAllUsers } from "@/lib/google-sheets-db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export default async function UsersPage() {
    const users = await getAllUsers();

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Last Login</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.plan === "premium" || user.plan === "enterprise" ? "default" : "secondary"}>
                                        {user.plan}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === "admin" ? "destructive" : "outline"}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.createdAt ? format(new Date(user.createdAt), 'PP') : 'N/A'}</TableCell>
                                <TableCell>{user.lastLogin ? format(new Date(user.lastLogin), 'PP p') : 'Never'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
