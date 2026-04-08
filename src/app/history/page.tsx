"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { History, Calendar as CalendarIcon, Dumbbell, Trash2, Edit2, Check, X } from "lucide-react";
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
  
  // Estados para controlar qué tarjeta se está editando
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<WorkoutLog>>({});

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

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "workouts", id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // --- NUEVAS FUNCIONES DE EDICIÓN ---
  const startEditing = (log: WorkoutLog) => {
    setEditingId(log.id);
    setEditValues({
      weight: log.weight,
      repetitions: log.repetitions,
      rpe: log.rpe
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleUpdate = async (id: string) => {
    try {
      const workoutRef = doc(db, "workouts", id);
      await updateDoc(workoutRef, {
        weight: Number(editValues.weight),
        repetitions: Number(editValues.repetitions),
        rpe: Number(editValues.rpe)
      });
      setEditingId(null); // Salimos del modo edición
    } catch (error) {
      console.error("Error al actualizar:", error);
    }
  };

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
            <p className="text-muted-foreground">Gestiona y edita tus marcas personales.</p>
          </div>
          <Badge variant="outline" className="w-fit border-primary/50 text-primary bg-primary/5 px-4 py-1.5 rounded-full">
            {logs.length} series registradas
          </Badge>
        </header>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-24 w-full bg-secondary" />
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
                  {new Date(date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {dateLogs.map((log) => (
                    <Card key={log.id} className="border-border hover:border-primary/50 transition-colors bg-card/50 overflow-hidden group">
                      <CardContent className="p-0">
                        <div className="flex items-center">
                          <div className="w-1.5 h-16 bg-primary shrink-0" />
                          <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-bold text-lg text-foreground">{log.exerciseName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {log.createdAt ? new Date(log.createdAt.seconds * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''}
                              </p>
                            </div>

                            {/* --- CONDICIONAL: MODO EDICIÓN vs MODO LECTURA --- */}
                            {editingId === log.id ? (
                              <div className="flex items-center gap-2 bg-secondary/20 p-2 rounded-lg flex-wrap">
                                <div className="w-20">
                                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Peso</label>
                                  <Input 
                                    type="number" 
                                    value={editValues.weight} 
                                    onChange={(e) => setEditValues({...editValues, weight: Number(e.target.value)})}
                                    className="h-8 text-xs bg-background" 
                                  />
                                </div>
                                <div className="w-16">
                                  <label className="text-[10px] uppercase text-muted-foreground font-bold">Reps</label>
                                  <Input 
                                    type="number" 
                                    value={editValues.repetitions} 
                                    onChange={(e) => setEditValues({...editValues, repetitions: Number(e.target.value)})}
                                    className="h-8 text-xs bg-background" 
                                  />
                                </div>
                                <div className="w-16">
                                  <label className="text-[10px] uppercase text-muted-foreground font-bold">RPE</label>
                                  <Input 
                                    type="number" 
                                    max="10" min="1"
                                    value={editValues.rpe} 
                                    onChange={(e) => setEditValues({...editValues, rpe: Number(e.target.value)})}
                                    className="h-8 text-xs bg-background" 
                                  />
                                </div>
                                <div className="flex gap-1 mt-4 sm:mt-0">
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-400 hover:bg-green-500/10" onClick={() => handleUpdate(log.id)}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10" onClick={cancelEditing}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-6">
                                <div className="text-center hidden sm:block">
                                  <p className="text-xs text-muted-foreground uppercase">Peso</p>
                                  <p className="font-bold text-primary text-xl">{log.weight}<span className="text-sm font-normal ml-0.5">kg</span></p>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <p className="text-xs text-muted-foreground uppercase">Reps</p>
                                  <p className="font-bold text-foreground text-xl">{log.repetitions}</p>
                                </div>
                                <div className="text-center hidden sm:block">
                                  <p className="text-xs text-muted-foreground uppercase">RPE</p>
                                  <Badge variant={log.rpe >= 9 ? "destructive" : "secondary"} className="mt-0.5">
                                    {log.rpe}
                                  </Badge>
                                </div>
                                
                                <div className="flex gap-1 ml-2">
                                  <button onClick={() => startEditing(log)} className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-full transition-all" title="Editar serie">
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleDelete(log.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all" title="Eliminar serie">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
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
