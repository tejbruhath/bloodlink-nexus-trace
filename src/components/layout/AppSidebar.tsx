import { useNavigate } from "react-router-dom";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { Droplet, Users, UserCircle, BarChartHorizontal, Repeat, ShieldCheck, LayoutDashboard, MapPin, ArrowLeftRight, BarChart2, Bell, Info } from "lucide-react";
import { NavLink } from "react-router-dom";

export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center space-x-2 px-2">
          <Droplet className="h-5 w-5 text-bloodlink-red" />
          <span className="text-base font-bold">BloodLink</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/")} asChild>
                  <button className="w-full">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/donors")} asChild>
                  <button className="w-full">
                    <UserCircle className="h-4 w-4" />
                    <span>Donors</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/recipients")} asChild>
                  <button className="w-full">
                    <Users className="h-4 w-4" />
                    <span>Recipients</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/inventory")} asChild>
                  <button className="w-full">
                    <BarChartHorizontal className="h-4 w-4" />
                    <span>Inventory</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/transfusions")} asChild>
                  <button className="w-full">
                    <Repeat className="h-4 w-4" />
                    <span>Transfusions</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/blockchain")} asChild>
                  <button className="w-full">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Blockchain</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/indian-donors")} asChild>
                  <button className="w-full">
                    <MapPin className="h-4 w-4" />
                    <span>Indian Donors</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/notifications")} asChild>
                  <button className="w-full">
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate("/about")} asChild>
                  <button className="w-full">
                    <Info className="h-4 w-4" />
                    <span>About</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2">
          <p className="text-xs text-sidebar-foreground/60">
            Version 1.0.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
