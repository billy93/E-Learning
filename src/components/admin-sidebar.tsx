"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  BookOpen,
  School,
  MessageSquare,
  BarChart3,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home
  },
  {
    title: "Kelola Pengguna",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Kelola Kursus",
    href: "/admin/courses",
    icon: BookOpen
  },
  {
    title: "Kelola Sekolah",
    href: "/admin/schools",
    icon: School
  },
  {
    title: "Pesan",
    href: "/messages",
    icon: MessageSquare
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3
  }
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                isActive 
                  ? "bg-blue-100 text-blue-700 font-medium" 
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center"
              )}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Link href="/dashboard">
          <div className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100 hover:text-gray-900",
            collapsed && "justify-center"
          )}>
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="truncate">Pengaturan</span>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}