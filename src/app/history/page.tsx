"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { History, Calendar as CalendarIcon, Filter, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutLog {
  id: string;
  exerciseName: string;
  weight: number;
  repetitions: number;
  rpe: number;
  date: string;
  createdAt: any;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "workouts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutLog[];
      setLogs(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const groupLogsByDate = (logs: WorkoutLog[]) => {
    return logs.reduce((groups: { [key: string]: WorkoutLog[] }, log) => {
      const date = log.date || "Fecha desconocida";
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
      return groups;
    }, {});
  };

  const groupedLogs = groupLogsByDate(logs);

  return (
    <div className="pb-24 pt-4 md:pt-20 min-h-screen bg-background px-4">
      <Navigation />
      
      <main className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
              <History className="text-primary" /> Tu Historial
            </h1>
            <p className="text-muted-foreground">Todos tus registros de entrenamiento en un solo lugar.</p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/50 text-primary bg-primary/5 px-4 py-1.5 rounded-full">
            {logs.length} series registradas
          </Badge>
        </header>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-32 bg-secondary" />
                <Skeleton className="h-24 w-full bg-secondary" />
                <Skeleton className="h-24 w-full bg-secondary" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <Card className="border-dashed border-2 border-border bg-transparent flex flex-col items-center justify-center p-12 text-center">
            <div className="p-4 bg-secondary rounded-full mb-4">
              <Dumbbell className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-headline font-semibold">No hay registros</h3>
            <p className="text-muted-foreground max-w-xs mt-2">Todavía no has registrado ningún ejercicio. ¡Empieza hoy mismo!</p>
          </Card>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <section key={date} className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent uppercase tracking-widest sticky top-16 md:top-20 z-10 bg-background/80 backdrop-blur-sm py-2">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {dateLogs.map((log) => (
                    <Card key={log.id} className="border-border hover:border-primary/50 transition-colors bg-card/50 overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex items-center">
                          <div className="w-1.5 h-16 bg-primary group-hover:bg-accent transition-colors shrink-0" />
                          <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-lg text-foreground">{log.exerciseName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase">Peso</p>
                                <p className="font-bold text-primary text-xl">{log.weight}<span className="text-sm font-normal ml-0.5">kg</span></p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase">Reps</p>
                                <p className="font-bold text-foreground text-xl">{log.repetitions}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground uppercase">RPE</p>
                                <Badge variant={log.rpe >= 9 ? "destructive" : "secondary"} className="mt-0.5">
                                  {log.rpe}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}