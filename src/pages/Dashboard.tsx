import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useBloodBank } from "@/contexts/BloodBankContext";
import { BarChart3, Droplet, HeartPulse, LifeBuoy, Users, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from '@/contexts/NotificationContext';
import { generateTestNotification } from '@/utils/notificationHelpers';

export default function Dashboard() {
  const { 
    donors, 
    recipients, 
    inventory, 
    transfusions,
    inventoryStats
  } = useBloodBank();
  const { addNotification } = useNotifications();

  // Calculate critical inventory
  const criticalInventory = inventoryStats.criticalLevels.length;

  // Calculate available blood units
  const availableBloodUnits = inventory.filter(item => item.status === 'Available').length;

  // Calculate pending transfusions
  const pendingTransfusions = transfusions.filter(t => t.status === 'Pending').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          BloodLink Supply Chain Nexus - Blood Donation Management System
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-bloodlink-red">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donors.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered blood donors
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-bloodlink-blue">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipients.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered recipients
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-urgency-high">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Transfusions</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransfusions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting completion
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-urgency-medium">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blood Inventory</CardTitle>
            <Droplet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableBloodUnits}</div>
            <p className="text-xs text-muted-foreground">
              Available blood units
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Blood Inventory by Type</CardTitle>
            <CardDescription>
              Current inventory levels for all blood types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(inventoryStats.byBloodType).map(([type, count]) => (
                <div 
                  key={type} 
                  className={`rounded-lg p-4 text-center ${
                    inventoryStats.criticalLevels.includes(type as any) 
                      ? 'bg-urgency-high/10 border border-urgency-high' 
                      : count < 3 
                        ? 'bg-urgency-medium/10 border border-urgency-medium'
                        : 'bg-status-valid/10 border border-status-valid'
                  }`}
                >
                  <div className="text-xl font-bold">{type}</div>
                  <div className="mt-1 text-sm">
                    {count} {count === 1 ? 'unit' : 'units'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blood Supply Status</CardTitle>
            <CardDescription>
              Critical levels and expiring units
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="h-4 w-4 text-urgency-high" />
                  <span className="text-sm font-medium">Critical Levels</span>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${
                  criticalInventory > 0 ? 'bg-urgency-high/10 text-urgency-high' : 'bg-status-valid/10 text-status-valid'
                }`}>
                  {criticalInventory > 0 ? `${criticalInventory} types` : 'All Good'}
                </span>
              </div>
              {criticalInventory > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {inventoryStats.criticalLevels.map((type) => (
                    <span key={type} className="rounded bg-urgency-high/10 px-2 py-0.5 text-xs text-urgency-high">
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-urgency-medium" />
                  <span className="text-sm font-medium">Expiring Soon</span>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${
                  inventoryStats.expiringWithin7Days > 0 
                    ? 'bg-urgency-medium/10 text-urgency-medium' 
                    : 'bg-status-valid/10 text-status-valid'
                }`}>
                  {inventoryStats.expiringWithin7Days} units
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => generateTestNotification(addNotification)}
          className="mr-2"
        >
          Generate Test Notification
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            addNotification(
              "Database Connected", 
              "Connection to Supabase established successfully.", 
              "success"
            );
          }}
        >
          Database Connected
        </Button>
      </div>
    </div>
  );
}
