"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardCheck, Loader2, CheckCircle2 } from "lucide-react";
import { submitTuesdayLogToSheets } from "@/lib/actions/crab-actions";

// Define the prop type for the initial worker name
interface TuesdayBreakdownProps {
  initialWorker: string;
}

export default function TuesdayBreakdown({
  initialWorker,
}: TuesdayBreakdownProps) {
  // Initialize state with the name passed from the server cookie
  const [worker, setWorker] = useState(initialWorker);
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const WORKER_LIST = ["Alex", "Brandon", "Jake", "Josh", "Steve", "Guest"];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirmed) return;

    setIsPending(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const result = await submitTuesdayLogToSheets(formData);

      if (result.success) {
        setIsPending(false);
        setIsSuccess(true);

        // Reset after success
        setTimeout(() => {
          setIsSuccess(false);
          setConfirmed(false);
          // We reset to initialWorker so the name stays filled in for the next log
          setWorker(initialWorker);
          form.reset();
        }, 1500);
      } else {
        setIsPending(false);
        alert("Error: " + result.error);
      }
    } catch (err) {
      setIsPending(false);
      console.error("Submission error:", err);
      alert("A network error occurred.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="text-2xl">🦀</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tuesday Crab Breakdown Form
          </h1>
          <p className="text-muted-foreground">
            Complete the weekly breakdown log for final verification.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        className="space-y-8"
      >
        {/* 1. Who is logging? */}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="grid gap-2 max-w-sm">
              <Label
                htmlFor="worker"
                className="text-sm font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Team Member Name
              </Label>
              <Select
                name="worker-name"
                value={worker}
                onValueChange={setWorker}
              >
                <SelectTrigger id="worker" className="h-11">
                  <SelectValue placeholder="-- Select Name --" />
                </SelectTrigger>
                <SelectContent>
                  {WORKER_LIST.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 3 Column Grid for Inventory */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Maryland Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-blue-500 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Maryland Inventory
            </h3>
            <div className="space-y-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 backdrop-blur-sm">
              <div className="grid gap-1.5">
                <Label>{`Maryland 1's`}</Label>
                <Input
                  name="md-1s"
                  type="number"
                  placeholder="0"
                  className="bg-background/50"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{`Maryland 2's`}</Label>
                <Input
                  name="md-2s"
                  type="number"
                  placeholder="0"
                  className="bg-background/50"
                />
              </div>
              <Separator className="my-4 bg-blue-500/20" />
              {[
                "Smalls",
                "Mediums",
                "Larges",
                "XLs",
                "Jumbos",
                "Bushels of 1's",
              ].map((size) => (
                <div key={size} className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {size}
                  </Label>
                  <Input
                    name={`md-${size.toLowerCase().replace(/\s/g, "-")}`}
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    className="h-9 bg-background/40"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Louisiana Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              Louisiana Inventory
            </h3>
            <div className="space-y-3 p-4 bg-red-500/5 rounded-xl border border-red-500/20 backdrop-blur-sm">
              <div className="grid gap-1.5">
                <Label>{`Louisiana 1's`}</Label>
                <Input
                  name="la-1s"
                  type="number"
                  placeholder="0"
                  className="bg-background/50"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>{`Louisiana 2's`}</Label>
                <Input
                  name="la-2s"
                  type="number"
                  placeholder="0"
                  className="bg-background/50"
                />
              </div>
              <Separator className="my-4 bg-red-500/20" />
              {[
                "Smalls",
                "Mediums",
                "Larges",
                "XLs",
                "Jumbos",
                "Bushels of 1's",
              ].map((size) => (
                <div key={size} className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {size}
                  </Label>
                  <Input
                    name={`la-${size.toLowerCase().replace(/\s/g, "-")}`}
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    className="h-9 bg-background/40"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Female Column */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-pink-500 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pink-500" />
              Female Inventory
            </h3>
            <div className="space-y-3 p-4 bg-pink-500/5 rounded-xl border border-pink-500/20 backdrop-blur-sm">
              <div className="grid gap-1.5">
                <Label>Boxes of Females</Label>
                <Input
                  name="num-fems"
                  type="number"
                  placeholder="0"
                  className="bg-background/50"
                />
              </div>
              <div className="h-[56px] hidden md:block" />
              <Separator className="my-4 bg-pink-500/20" />
              {[
                "Regular Females",
                "Large Females",
                "XL Females",
                "Jumbo Females",
              ].map((size) => (
                <div key={size} className="grid gap-1.5">
                  <Label className="text-xs text-muted-foreground">
                    {size}
                  </Label>
                  <Input
                    name={`fem-${size.toLowerCase().replace(/\s/g, "-")}`}
                    type="number"
                    step="0.5"
                    placeholder="0.0"
                    className="h-9 bg-background/40"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Confirmation */}
        {!isSuccess && (
          <Card className="bg-muted/30 border-dashed border-2 border-primary/20 animate-in fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="confirm"
                  className="h-5 w-5"
                  checked={confirmed}
                  onCheckedChange={(val) => setConfirmed(val as boolean)}
                />
                <Label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none"
                >
                  I,{" "}
                  <span className="font-bold underline text-primary">
                    {worker || "____"}
                  </span>
                  , have verified all counts.
                </Label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success/Submit Area */}
        <div className="min-h-[56px]">
          {isSuccess ? (
            <div className="w-full h-24 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center gap-3 text-emerald-500 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="h-8 w-8" />
              <div className="text-center">
                <p className="text-xl font-bold">Log Submitted Successfully!</p>
                <p className="text-sm opacity-80">
                  All records have been sent to the spreadsheet.
                </p>
              </div>
            </div>
          ) : (
            confirmed && (
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-4"
                size="lg"
              >
                {isPending ? (
                  <Loader2 className="animate-spin mr-2 h-6 w-6" />
                ) : (
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="h-6 w-6" />
                    SUBMIT TUESDAY LOG
                  </div>
                )}
              </Button>
            )
          )}
        </div>
      </form>
    </div>
  );
}
