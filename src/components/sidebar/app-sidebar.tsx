import { Bot, Calendar, ChevronUp, Home, Inbox, PanelsTopLeft, Search, Settings, User2, UsersRound } from "lucide-react"
 
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu"
 
// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "inbox",
    icon: Inbox,
  },
  {
    title: "AI Assitant",
    url: "/ai-assistant",
    icon: Bot,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: PanelsTopLeft,
  },
  {
    title: "Settings",
    url: "/profile",
    icon: Settings,
  },
]
 
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="flex gap-4">
                <div className="bg-black rounded-md p-3">
                    <UsersRound className="text-white h-4 w-4"/>
                </div>
                <div className="flex items-center">
                    <p className="text-lg">SynergySphere</p>
                    
                </div>
            </div>
          </SidebarGroupContent>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
          
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
            <SidebarTrigger />
          </SidebarFooter>
    </Sidebar>
  )
}