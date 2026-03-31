"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, TrendingDown, ClipboardCheck } from "lucide-react";
import { submitDeadLoss } from "@/lib/actions/crab-actions";

export default function DailyDeadLoss() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [losses, setLosses] = useState({
    morn_loss: 0,
    grade_loss: 0,
  });

  const totalLoss = Number(losses.morn_loss) + Number(losses.grade_loss);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLosses((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitDeadLoss(formData);

    if (result.success) {
      setIsPending(false);
      setIsSuccess(true);
      setLosses({ morn_loss: 0, grade_loss: 0 });
      e.currentTarget.reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } else {
      setIsPending(false);
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <TrendingDown className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Daily Dead Loss Breakdown
            </h1>
            <p className="text-muted-foreground">
              Record dead loss metrics to maintain accurate inventory waste logs.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="space-y-8"
      >
        <div className="grid gap-6 md:grid-cols-3">
          {/* Morning Loss Card */}
          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-md shadow-sm transition-all group">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[11px]">
                <div className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                Running Loss
              </div>
              <div className="space-y-3 p-5 bg-orange-500/5 rounded-2xl border border-orange-500/10 group-hover:border-orange-500/30 transition-colors">
                <div className="grid gap-2">
                  <Label htmlFor="morn_loss" className="text-[10px] font-bold uppercase text-muted-foreground/80">
                    Dead Loss from Running (lbs)
                  </Label>
                  <div className="relative">
                    <Input
                      id="morn_loss"
                      name="morn_loss"
                      type="number"
                      step="0.01"
                      value={losses.morn_loss || ""}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="h-12 bg-background/60 border-orange-500/20 focus-visible:ring-orange-500 pr-12 text-lg font-semibold"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">LBS</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grading Loss Card */}
          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-md shadow-sm transition-all group">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-widest text-[11px]">
                <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                Grading Loss
              </div>
              <div className="space-y-3 p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                <div className="grid gap-2">
                  <Label htmlFor="grade_loss" className="text-[10px] font-bold uppercase text-muted-foreground/80">
                    Dead Loss from Grading (lbs)
                  </Label>
                  <div className="relative">
                    <Input
                      id="grade_loss"
                      name="grade_loss"
                      type="number"
                      step="0.01"
                      value={losses.grade_loss || ""}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="h-12 bg-background/60 border-blue-500/20 focus-visible:ring-blue-500 pr-12 text-lg font-semibold"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">LBS</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Summary Card */}
          <Card className="border-2 border-primary/20 bg-primary/5 backdrop-blur-md shadow-lg relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-3 opacity-10">
               <TrendingDown className="h-16 w-16 -rotate-12" />
            </div>
            <CardContent className="pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-1">
                Calculated Total
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-primary">
                  {totalLoss.toFixed(2)}
                </span>
                <span className="text-xl font-bold text-muted-foreground uppercase">lbs</span>
              </div>
              <p className="text-xs font-medium text-muted-foreground/60 mt-2 italic">
                Combined daily inventory loss
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submit Section */}
        <div className="min-h-[64px]">
          {isSuccess ? (
            <div className="w-full h-16 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center gap-3 text-emerald-500 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="h-6 w-6" />
              <p className="text-lg font-bold">Daily Loss Saved Successfully</p>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isPending ? (
                <Loader2 className="animate-spin mr-2 h-6 w-6" />
              ) : (
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="h-6 w-6" />
                  SUBMIT LOSS RECORDS
                </div>
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}