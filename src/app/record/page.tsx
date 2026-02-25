"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dumbbell, Weight, Hash, Activity, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const COMMON_EXERCISES = [
  "Press de Banca",
  "Sentadilla",
  "Peso Muerto",
  "Press Militar",
  "Remo con Barra",
  "Dominadas",
  "Zancadas",
  "Press Inclinado",
  "Curl de Bíceps",
  "Extensiones de Tríceps",
];

export default function RecordPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    exerciseName: "",
    weight: "",
    repetitions: "",
    rpe: "8"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, "workouts"), {
        userId: user.uid,
        exerciseName: formData.exerciseName,
        weight: parseFloat(formData.weight),
        repetitions: parseInt(formData.repetitions),
        rpe: parseInt(formData.rpe),
        createdAt: serverTimestamp(),
        date: new Date().toISOString().split('T')[0]
      });
      
      toast({ title: "Registro guardado", description: "¡Buen trabajo con esa serie!" });
      setFormData({ ...formData, weight: "", repetitions: "" }); // Reset some fields
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al guardar", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-20 min-h-screen bg-background px-4">
      <Navigation />
      
      <main className="max-w-2xl mx-auto animate-fade-in">
        <header className="mb-8 space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
            <Dumbbell className="text-primary" /> Registrar Serie
          </h1>
          <p className="text-muted-foreground">Registra cada serie de tu entrenamiento.</p>
        </header>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Detalles del Ejercicio</CardTitle>
            <CardDescription>Completa los campos para guardar tu progreso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise" className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" /> Ejercicio
                  </Label>
                  <Input 
                    id="exercise"
                    list="exercises-list"
                    placeholder="Escribe el nombre del ejercicio..."
                    value={formData.exerciseName}
                    onChange={(e) => setFormData({...formData, exerciseName: e.target.value})}
                    required
                    className="bg-secondary/50 h-12"
                  />
                  <datalist id="exercises-list">
                    {COMMON_EXERCISES.map(ex => <option key={ex} value={ex} />)}
                  </datalist>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-2">
                      <Weight className="h-4 w-4 text-primary" /> Peso (kg)
                    </Label>
                    <Input 
                      id="weight"
                      type="number"
                      step="0.5"
                      placeholder="80"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      required
                      className="bg-secondary/50 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reps" className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-primary" /> Repeticiones
                    </Label>
                    <Input 
                      id="reps"
                      type="number"
                      placeholder="10"
                      value={formData.repetitions}
                      onChange={(e) => setFormData({...formData, repetitions: e.target.value})}
                      required
                      className="bg-secondary/50 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rpe" className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" /> Esfuerzo Percibido (RPE 1-10)
                  </Label>
                  <Select 
                    value={formData.rpe} 
                    onValueChange={(val) => setFormData({...formData, rpe: val})}
                  >
                    <SelectTrigger className="bg-secondary/50 h-12">
                      <SelectValue placeholder="Selecciona RPE" />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <SelectItem key={n} value={n.toString()}>
                          {n} - {n >= 9 ? 'Máximo' : n >= 7 ? 'Duro' : 'Moderado'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground px-1">
                    10: Sin repeticiones en recámara. 8: Podrías hacer 2 más.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 h-12 font-bold text-lg" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                  Guardar Serie
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 border-border"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}