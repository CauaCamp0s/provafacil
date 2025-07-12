"use client"

import { FileText, Users, DollarSign, BarChart3, Settings, LogOut, User, X, Shield } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

const adminMenuItems = [
  {
    title: "Dashboard Admin",
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "Usuários",
    url: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Faturamento",
    url: "/admin/faturamento",
    icon: DollarSign,
  },
  {
    title: "Sistema",
    url: "/admin/sistema",
    icon: Settings,
  },
]

export function AdminSidebar() {
  const router = useRouter()
  const { toast } = useToast()
  const { setOpen } = useSidebar()

  const handleLogout = () => {
    toast({
      title: "Logout realizado com sucesso!",
      description: "Até logo, Admin!",
    })
    router.push("/")
  }

  const handleCloseSidebar = () => {
    setOpen(false)
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCloseSidebar}
            className="h-8 w-8 p-0 hover:bg-gray-100"
            title="Fechar sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleBackToDashboard}>
                  <FileText className="w-4 h-4" />
                  <span>Voltar ao Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    A
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Admin Sistema</span>
                    <span className="text-xs text-gray-600">Administrador</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  <span>Perfil Admin</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBackToDashboard}>
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Dashboard Normal</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
