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

        {/* Inventory Section */}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Inventory Counts
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter the current stock levels for each regional category and
                size.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              {/* Maryland Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Maryland Inventory
                </div>
                <div className="space-y-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Maryland 1's
                    </Label>
                    <Input
                      name="md-1s"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Maryland 2's
                    </Label>
                    <Input
                      name="md-2s"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>
                  <Separator className="my-2 bg-blue-500/20" />
                  {[
                    "Smalls",
                    "Mediums",
                    "Larges",
                    "XLs",
                    "Jumbos",
                    "Medium Larges",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        MD {size}
                      </Label>
                      <Input
                        name={`md-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Louisiana Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Louisiana Inventory
                </div>
                <div className="space-y-3 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Louisiana 1's
                    </Label>
                    <Input
                      name="la-1s"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Louisiana 2's
                    </Label>
                    <Input
                      name="la-2s"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>
                  <Separator className="my-2 bg-red-500/20" />
                  {[
                    "Smalls",
                    "Mediums",
                    "Larges",
                    "XLs",
                    "Jumbos",
                    "Medium Larges",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        LA {size}
                      </Label>
                      <Input
                        name={`la-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Texas Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Texas Inventory
                </div>
                <div className="space-y-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Texas 1's
                    </Label>
                    <Input
                      name="tx-1s"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Texas 2's
                    </Label>
                    <Input
                      name="tx-2s"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>
                  <Separator className="my-2 bg-orange-500/20" />
                  {[
                    "Smalls",
                    "Mediums",
                    "Larges",
                    "XLs",
                    "Jumbos",
                    "Medium Larges",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        TX {size}
                      </Label>
                      <Input
                        name={`tx-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Female Column */}
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Female Inventory
                </div>

                <div className="flex-1 space-y-3 p-4 bg-pink-500/5 rounded-xl border border-pink-500/10">
                  {/* Row 1: Aligns with MD/LA/TX 1's */}
                  <div className="grid gap-1.5">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Boxes of Females
                    </Label>
                    <Input
                      name="num-fems"
                      type="number"
                      placeholder="0"
                      className="h-9 bg-background/50"
                    />
                  </div>

                  {/* Row 2: HIDDEN SPACER - Aligns with MD/LA/TX 2's */}
                  {/* This ensures the Separator below it is perfectly level across the grid */}
                  <div
                    className="grid gap-1.5 invisible select-none"
                    aria-hidden="true"
                  >
                    <Label className="text-[10px] uppercase">Spacer</Label>
                    <div className="h-9" />
                  </div>

                  {/* Separator - Now perfectly aligned with MD, LA, and TX separators */}
                  <Separator className="my-2 bg-pink-500/20" />

                  {/* Row 3+: Aligns with Regular, Smalls, etc. */}
                  {[
                    "Regular Females",
                    "Large Females",
                    "XL Females",
                    "Jumbo Females",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        {size}
                      </Label>
                      <Input
                        name={`fem-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.0"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weights Section */}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Average Weights (lbs)
              </h3>
              <p className="text-sm text-muted-foreground">
                Enter the recorded weights for each specific regional category.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              {/* Maryland Male Weights */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Maryland Males
                </div>
                <div className="space-y-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  {[
                    "Smalls",
                    "Mediums",
                    "Larges",
                    "XLs",
                    "Jumbos",
                    "Medium Larges",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        MD {size}
                      </Label>
                      <Input
                        name={`weight-md-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Louisiana Male Weights */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  Louisiana Males
                </div>
                <div className="space-y-3 p-4 bg-red-500/5 rounded-xl border border-red-500/10">
                  {[
                    "Smalls",
                    "Mediums",
                    "Larges",
                    "XLs",
                    "Jumbos",
                    "Medium Larges",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        LA {size}
                      </Label>
                      <Input
                        name={`weight-la-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Texas Male Weights (New) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  Texas Males
                </div>
                <div className="space-y-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  {[
                    "Smalls",
                    "Mediums",
                    "Larges",
                    "XLs",
                    "Jumbos",
                    "Medium Larges",
                  ].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        TX {size}
                      </Label>
                      <Input
                        name={`weight-tx-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Female Weights */}
              <div className="space-y-4 flex flex-col h-full">
                <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Female Categories
                </div>
                {/* h-full ensures this box stretches to match the tallest sibling in the grid */}
                <div className="h-full space-y-3 p-4 bg-pink-500/5 rounded-xl border border-pink-500/10">
                  {["Regular", "Large", "XL", "Jumbo"].map((size) => (
                    <div key={size} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        {size} Females
                      </Label>
                      <Input
                        name={`weight-fem-${size.toLowerCase().replace(/\s/g, "-")}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dead Loss Section*/}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                Dead Loss (lbs)
              </h3>
              <p className="text-sm text-muted-foreground">
                Record dead loss weights categorized by size and grade.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* #1 Males Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  #1 Males
                </div>
                <div className="space-y-3 p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  {[{ label: "Dead #1's", id: "dead-1s" }].map((item) => (
                    <div key={item.id} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        {item.label}
                      </Label>
                      <Input
                        name={`deadloss-${item.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* #2 Males Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  #2 Males
                </div>
                <div className="space-y-3 p-4 bg-orange-500/5 rounded-xl border border-orange-500/10">
                  {[{ label: "Dead #2's", id: "dead-2s" }].map((item) => (
                    <div key={item.id} className="grid gap-1.5">
                      <Label className="text-[10px] uppercase text-muted-foreground">
                        {item.label}
                      </Label>
                      <Input
                        name={`deadloss-${item.id}`}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-9 bg-background/40"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Females Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-wider text-[10px]">
                  <div className="h-2 w-2 rounded-full bg-pink-500" />
                  Females
                </div>
                <div className="space-y-3 p-4 bg-pink-500/5 rounded-xl border border-pink-500/10">
                  {[{ label: "Dead Females", id: "dead-females" }].map(
                    (item) => (
                      <div key={item.id} className="grid gap-1.5">
                        <Label className="text-[10px] uppercase text-muted-foreground">
                          {item.label}
                        </Label>
                        <Input
                          name={`deadloss-${item.id}`}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="h-9 bg-background/40"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
