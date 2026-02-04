// End of Day Breakdown Form

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Receipt,
  Package,
  Clock,
  CheckCircle2,
  Loader2,
  DollarSign,
} from "lucide-react";
import { submitEoDBreakdownToSheets } from "@/lib/actions/crab-actions";

export default function EoDSalesBreakdown() {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const WEATHER_CONDITIONS = [
    "Sunny",
    "Rainy",
    "Snowing",
    "Cloudy",
    "Windy",
    "Thunderstorm",
  ];

  const MALE_SIZES = ["SM", "MD", "ML", "LG", "XL", "JUMBO", "SUPER"];
  const FEMALE_SIZES = ["REGF", "LGF", "XLF", "JUMBOF"];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    // 2. Grab the FormData from the form
    const formData = new FormData(e.currentTarget);

    // 3. Call the action
    const result = await submitEoDBreakdownToSheets(formData);

    if (result.success) {
      setIsPending(false);
      setIsSuccess(true);
      // Optional: e.currentTarget.reset();
      setTimeout(() => setIsSuccess(false), 5000);
    } else {
      setIsPending(false);
      alert("Error: " + result.error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
          <Receipt className="text-emerald-500 h-6 w-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            End of Day Sales Breakdown
          </h1>
          <p className="text-muted-foreground">
            {`Finalize the day's inventory, labor, and financial totals.`}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        className="space-y-8"
      >
        {/* 1. General Info & Weather */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Time & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Time of Closing</Label>
                <Input
                  name="time-closed"
                  type="time"
                  required
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Weather (°F)</Label>
                  <Input
                    name="weather-val"
                    type="number"
                    placeholder="72"
                    className="bg-background/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Condition</Label>
                  <Select name="weather-condition">
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {WEATHER_CONDITIONS.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" /> Specials Ran
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="mb-2 block text-xs text-muted-foreground">
                List any promos or discounts ran today
              </Label>
              <Textarea
                name="specials"
                placeholder="e.g. $10 off 2 Dozen LG, Buy 1 get 1/2 free SM..."
                className="min-h-[110px] bg-background/50 focus:ring-emerald-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* 2. End of Day Counts*/}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" /> Remaining Inventory
              (Dozen Counts)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Males Row */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
                  Male Counts
                </span>
                <Separator className="flex-1 opacity-50" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {MALE_SIZES.map((size) => (
                  <div key={size} className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-muted-foreground">
                      {size}
                    </Label>
                    <Input
                      name={`eod-${size}`}
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      className="h-9 bg-background/50 border-blue-500/20 shadow-sm focus-visible:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Females Row */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-500/50">
                  Female Counts
                </span>
                <Separator className="flex-1 bg-pink-500/20" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                {FEMALE_SIZES.map((size) => (
                  <div key={size} className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-pink-500">
                      {size}
                    </Label>
                    <Input
                      name={`eod-fem-${size}`}
                      type="number"
                      step="0.5"
                      placeholder="0.0"
                      className="h-9 bg-background/50 border-pink-500/20 shadow-sm focus-visible:ring-pink-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator className="bg-primary/10" />

            {/* Bushels & Ungraded Section */}
            <div className="grid grid-cols-2 max-w-md gap-4">
              <div className="space-y-2">
                <Label className="text-blue-500 font-bold">
                  #1 Bushels Remaining
                </Label>
                <Input
                  name="eod-bushels"
                  type="number"
                  step="0.5"
                  placeholder="0.0"
                  className="bg-background/50 border-blue-500/30 focus-visible:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-amber-600 font-bold">
                  Ungraded Boxes
                </Label>
                <Input
                  name="eod-ungraded-boxes"
                  type="number"
                  step="1"
                  placeholder="0"
                  className="bg-background/50 border-amber-500/30 focus-visible:ring-amber-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Sales Volume & Financials */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Crabs Sold</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Dozens Sold</Label>
                <Input
                  name="dozens-sold"
                  type="number"
                  step="0.5"
                  placeholder="0.0"
                  className="bg-background/50"
                />
              </div>
              <div className="grid gap-2">
                <Label>Bushels Sold</Label>
                <Input
                  name="bushels-sold"
                  type="number"
                  step="0.5"
                  placeholder="0.0"
                  className="bg-background/50"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                Sales Report
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="font-bold">Total Sales ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="total-sales"
                    type="number"
                    step="0.01"
                    className="pl-9 bg-background/50 font-mono text-lg"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Card Sales
                  </Label>
                  <Input
                    name="card-sales"
                    type="number"
                    step="0.01"
                    className="bg-background/50"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs text-muted-foreground">
                    Cash Sales
                  </Label>
                  <Input
                    name="cash-sales"
                    type="number"
                    step="0.01"
                    className="bg-background/50"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 4. Labor Breakdown */}
        <Card className="border-2 border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-500" /> Staffing Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Total Employees Worked</Label>
                  <Input
                    name="num-employees"
                    type="number"
                    placeholder="0"
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-orange-500/5 rounded-lg border border-orange-500/20">
                <div className="grid gap-2 text-orange-600 dark:text-orange-400 font-bold">
                  <Label>Late Employees</Label>
                  <Input
                    name="num-late-employees"
                    type="number"
                    placeholder="0"
                    className="bg-background/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Reason for Lateness</Label>
                  <Input
                    name="late-reason"
                    placeholder="Traffic, etc."
                    className="bg-background/50 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4 p-4 bg-blue-500/5 rounded-lg border border-blue-500/20">
                <div className="grid gap-2 text-blue-600 dark:text-blue-400 font-bold">
                  <Label>Employees Cut Early</Label>
                  <Input
                    name="num-cut"
                    type="number"
                    placeholder="0"
                    className="bg-background/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs">Reason for Cut</Label>
                  <Input
                    name="cut-reason"
                    placeholder="Slow business, etc."
                    className="bg-background/50 text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success / Submit Area */}
        <div className="min-h-[100px] flex flex-col items-center justify-center">
          {isSuccess ? (
            <div className="w-full h-24 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center gap-4 text-emerald-500 animate-in zoom-in-95 duration-300">
              <CheckCircle2 className="h-10 w-10" />
              <div className="text-left">
                <p className="text-xl font-bold">
                  End of Day Report Finalized!
                </p>
                <p className="text-sm opacity-80">
                  All sales and labor metrics have been recorded.
                </p>
              </div>
            </div>
          ) : (
            <Button
              type="submit"
              disabled={isPending}
              className="w-full max-w-md h-16 text-xl font-black bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20"
            >
              {isPending ? (
                <Loader2 className="animate-spin mr-2 h-6 w-6" />
              ) : (
                "FINALIZE END OF DAY"
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
