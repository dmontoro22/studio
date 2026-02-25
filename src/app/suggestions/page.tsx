"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigation } from "@/components/Navigation";
import { suggestWorkoutPlan, SuggestWorkoutPlanOutput } from "@/ai/flows/suggest-workout-plan";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, BrainCircuit, Target, Lightbulb, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SuggestionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SuggestWorkoutPlanOutput | null>(null);

  const handleGenerate = async () => {
    if (!user) return;
    if (!goals.trim()) {
      toast({ variant: "destructive", title: "Faltan objetivos", description: "Por favor, cuéntanos qué quieres conseguir." });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch last 10 exercises to provide context to AI
      const q = query(
        collection(db, "workouts"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          exerciseName: d.exerciseName,
          weight: d.weight,
          repetitions: d.repetitions,
          rpe: d.rpe,
          date: d.date || new Date().toISOString().split('T')[0]
        };
      });

      const output = await suggestWorkoutPlan({
        exerciseHistory: history,
        userGoals: goals
      });

      setResult(output);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error de IA", description: error.message || "No se pudo generar el plan." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-4 md:pt-20 min-h-screen bg-background px-4">
      <Navigation />
      
      <main className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <header className="space-y-1">
          <h1 className="text-3xl font-headline font-bold text-foreground flex items-center gap-3">
            <Sparkles className="text-accent" /> Entrenador IA
          </h1>
          <p className="text-muted-foreground">Sugerencias personalizadas basadas en tu historial y objetivos.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-6">
            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent">
                  <Target className="h-5 w-5" /> Tus Metas
                </CardTitle>
                <CardDescription>
                  Define tus objetivos para que la IA pueda orientarte mejor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goals">¿Qué quieres lograr?</Label>
                  <Textarea 
                    id="goals"
                    placeholder="Ej: Aumentar mi fuerza en press de banca o mejorar mi técnica de sentadilla..."
                    className="min-h-[120px] bg-secondary/30 resize-none"
                    value={goals}
                    onChange={(e) => setGoals(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleGenerate} 
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analizando historial...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="mr-2 h-4 w-4" /> Generar Sugerencias
                    </>
                  )}
                </Button>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t border-accent/20 pt-4">
                Nota: La IA utiliza tus últimos 10 registros como contexto.
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-7">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border rounded-lg bg-card/20">
                <div className="p-4 bg-secondary rounded-full mb-4">
                  <Lightbulb className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-headline font-medium">Esperando tus metas</h3>
                <p className="text-muted-foreground mt-2">Completa el formulario de la izquierda para recibir consejos personalizados de entrenamiento.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in">
                <Card className="border-primary/50 shadow-lg shadow-primary/5 overflow-hidden">
                  <div className="bg-primary/10 p-4 border-b border-primary/20">
                    <h3 className="font-headline font-bold text-primary flex items-center gap-2">
                      <Sparkles className="h-5 w-5" /> Plan Recomendado
                    </h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      {result.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="mt-1">
                            <div className="h-6 w-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold border border-accent/30 group-hover:scale-110 transition-transform">
                              {idx + 1}
                            </div>
                          </div>
                          <p className="text-foreground leading-relaxed">{suggestion}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-border">
                      <h4 className="text-sm font-semibold text-accent uppercase tracking-wider mb-2 flex items-center gap-2">
                        <BrainCircuit className="h-4 w-4" /> Justificación Técnica
                      </h4>
                      <div className="bg-secondary/30 p-4 rounded-lg text-sm text-muted-foreground italic">
                        "{result.rationale}"
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setResult(null)}
                >
                  Reiniciar y Probar Otro Objetivo
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}