"use client"

import { FileText, Plus, BookOpen, CreditCard, LogOut, User, Home, X, Shield, FileCheck } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth"

const menuItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Criar Nova Prova",
    url: "/dashboard/criar-prova",
    icon: Plus,
  },
  {
    title: "Provas Salvas",
    url: "/dashboard/provas-salvas",
    icon: BookOpen,
  },
  {
    title: "Meus Gabaritos",
    url: "/dashboard/gabaritos",
    icon: FileCheck,
  },
  {
    title: "Meu Plano",
    url: "/dashboard/meu-plano",
    icon: CreditCard,
  },
  {
    title: "Perfil",
    url: "/dashboard/perfil",
    icon: User,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const { toast } = useToast()
  const { setOpen } = useSidebar()
  const { user, isAdmin, logout } = useAuth()

  const handleLogout = () => {
    logout()
    toast({
      title: "Logout realizado com sucesso!",
      description: "Até logo!",
    })
    router.push("/")
  }

  const handleCloseSidebar = () => {
    setOpen(false)
  }

  const handleAdminAccess = () => {
    router.push("/admin")
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U"
    return user.name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (!user) return "Usuário"
    return user.name
  }

  // Get user role display
  const getUserRoleDisplay = () => {
    if (isAdmin) return "Administrador"
    return "Plano Professor"
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-2 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ProvaFácil</span>
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
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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

        {/* Seção Admin - só aparece para administradores */}
        {isAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administração</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/admin">
                        <Shield className="w-4 h-4" />
                        <span>Painel Admin</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {getUserInitials()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{getUserDisplayName()}</span>
                    <span className="text-xs text-gray-600">{getUserRoleDisplay()}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/perfil">
                    <User className="w-4 h-4 mr-2" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>

                {/* Opção de Admin só aparece para administradores */}
                {isAdmin && (
                  <DropdownMenuItem onClick={handleAdminAccess}>
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Painel Admin</span>
                  </DropdownMenuItem>
                )}

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
