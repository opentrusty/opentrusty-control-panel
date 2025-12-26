import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Key, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";

export default function TenantOverview() {
  const { tenantId } = useParams<{ tenantId: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tenant Overview</h2>
        <p className="text-muted-foreground">
          Manage your tenant settings and resources.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              Manage users and their roles within this tenant.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to={`/tenant/${tenantId}/users`}>Manage Users</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              OAuth2 Clients
            </CardTitle>
            <CardDescription>
              Manage OAuth2 applications and API credentials.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link to={`/tenant/${tenantId}/clients`}>Manage Clients</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
