"use client";

import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dumbbell, Plus, History, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalLogs: 0, lastExercise: "N/A" });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const q = query(
        collection(db, "workouts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setStats({
          totalLogs: snapshot.size,
          lastExercise: snapshot.docs[0].data().exerciseName
        });
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="pb-24 pt-4 md:pt-20 min-h-screen bg-background px-4">
      <Navigation />
      
      <main className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        <header className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground">
            Hola, <span className="text-primary">{user?.email?.split('@')[0] || 'Atleta'}</span>
          </h1>
          <p className="text-muted-foreground">Bienvenido de nuevo a tu panel de entrenamiento.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Entrenamientos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-headline font-bold text-primary">{stats.totalLogs}</div>
              <p className="text-xs text-muted-foreground mt-1">Registros acumulados</p>
            </CardContent>
          </Card>

          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Último Ejercicio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-headline font-bold text-accent truncate">{stats.lastExercise}</div>
              <p className="text-xs text-muted-foreground mt-1">Tu última sesión registrada</p>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50 border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Consistencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-green-400 h-6 w-6" />
                <span className="text-2xl font-headline font-bold">En racha</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">¡Sigue así!</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="space-y-4">
            <h2 className="text-xl font-headline font-semibold flex items-center space-x-2">
              <Plus className="h-5 w-5 text-primary" />
              <span>Acciones Rápidas</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/record" className="block">
                <Button className="w-full h-24 flex flex-col space-y-2 bg-primary hover:bg-primary/90">
                  <Dumbbell className="h-6 w-6" />
                  <span>Registrar Serie</span>
                </Button>
              </Link>
              <Link href="/history" className="block">
                <Button variant="outline" className="w-full h-24 flex flex-col space-y-2 border-primary/50 text-primary hover:bg-primary/10">
                  <History className="h-6 w-6" />
                  <span>Ver Historial</span>
                </Button>
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-headline font-semibold flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-accent" />
              <span>Entrenador IA</span>
            </h2>
            <Card className="bg-accent/5 border-accent/20 h-[112px]">
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-accent">¿Necesitas variar?</h3>
                  <p className="text-sm text-muted-foreground">Deja que la IA analice tu progreso.</p>
                </div>
                <Link href="/suggestions">
                  <Button size="icon" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full">
                    <Sparkles className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}