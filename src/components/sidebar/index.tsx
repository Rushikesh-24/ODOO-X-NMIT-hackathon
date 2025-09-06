
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import { DynamicBreadcrumb } from "../breadcrumb"
import { Separator } from "../ui/separator"
import Header from "../header/header"

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Header />
        <DynamicBreadcrumb/>
        {children}
      </main>
    </SidebarProvider>
  )
}