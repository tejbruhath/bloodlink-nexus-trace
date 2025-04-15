import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function AppHeader() {
  return (
    <header className="border-b h-12 px-3 flex items-center justify-between bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-base font-semibold text-bloodlink-dark hidden sm:block">
          BloodLink Nexus
        </h1>
      </div>
      <div className="flex items-center">
        <NotificationBell />
      </div>
    </header>
  );
}
