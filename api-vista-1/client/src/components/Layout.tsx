import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Database,
  Globe,
  Building,
  Cloud,
  Layers,
  Route,
  Play,
  Settings,
  Tag,
  Search,
  Home,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Providers", href: "/providers", icon: Building },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Services", href: "/services", icon: Cloud },
  { name: "APIs", href: "/apis", icon: Layers },
  { name: "Endpoints", href: "/endpoints", icon: Route },
  { name: "Operations", href: "/operations", icon: Play },
  { name: "Documentation", href: "/docs", icon: Book },
];

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <Database className="h-8 w-8 text-blue-600" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    API Management Hub
                  </h1>
                </div>
              </Link>
            </div>
            
            {/* Search */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search providers, APIs, endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>

            {/* Branding */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Developed by <span className="font-semibold text-blue-600">Duais</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white dark:bg-gray-800 shadow-sm min-h-screen border-r">
          <div className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href || 
                (item.href !== "/" && location.startsWith(item.href));
              
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    )}
                    data-testid={`link-${item.name.toLowerCase()}`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              © 2024 API Management Hub. All rights reserved.
            </div>
            <div className="font-semibold">
              Developed by <span className="text-blue-600">Duais</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}