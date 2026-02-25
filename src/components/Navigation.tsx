"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dumbbell, History, Sparkles, LogOut, LayoutDashboard } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { name: "Panel", href: "/dashboard", icon: LayoutDashboard },
    { name: "Registrar", href: "/record", icon: Dumbbell },
    { name: "Historial", href: "/history", icon: History },
    { name: "IA Entrenador", href: "/suggestions", icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="hidden md:flex items-center space-x-2 mr-8">
          <Dumbbell className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg text-primary">TFG Entrenamiento</span>
        </div>

        <div className="flex flex-1 justify-around md:justify-start md:space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 text-xs md:text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut(auth)}
          className="text-muted-foreground hover:text-destructive"
          title="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </nav>
  );
}