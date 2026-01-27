// Crab Invoice Form

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Trash2,
  Plus,
  ReceiptText,
  Truck,
  Warehouse,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { submitInvoicesToSheets } from "@/lib/actions/crab-actions";

type Entry = {
  id: string;
  type: "Dock" | "Wholesaler";
  distributor: string;
  ones: number;
  twos: number;
  females: number;
};

const DISTRIBUTORS = {
  Dock: ["Nola", "Jake's", "Cajun", "Phil's"],
  Wholesaler: [
    "Coastal Fresh Seafood",
    "Dipper's Seafood",
    "Southern MD Crabs",
    "BCU INC.",
    "Choptank River Crab Co.",
  ],
};

export default function CrabInvoicePage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // NEW STATE

  const [selectedType, setSelectedType] = useState<"Dock" | "Wholesaler">(
    "Dock",
  );
  const [selectedDist, setSelectedDist] = useState("");
  const [ones, setOnes] = useState("");
  const [twos, setTwos] = useState("");
  const [females, setFemales] = useState("");

  const availableDistributors = useMemo(() => {
    const used = entries.map((e) => e.distributor);
    return DISTRIBUTORS[selectedType].filter((d) => !used.includes(d));
  }, [selectedType, entries]);

  const addEntry = () => {
    if (!selectedDist) return;
    const newEntry: Entry = {
      id: crypto.randomUUID(),
      type: selectedType,
      distributor: selectedDist,
      ones: Number(ones) || 0,
      twos: Number(twos) || 0,
      females: Number(females) || 0,
    };
    setEntries([...entries, newEntry]);
    setSelectedDist("");
    setOnes("");
    setTwos("");
    setFemales("");
    setIsSuccess(false); // Reset success if they add more
  };

  const removeEntry = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id));
  };

  const handleSubmit = async () => {
    if (entries.length === 0) return;
    setIsPending(true);

    // Use the real Server Action instead of a timeout
    const result = await submitInvoicesToSheets(entries);

    if (result.success) {
      setIsPending(false);
      setIsSuccess(true);
      setEntries([]); // Clear the queue

      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } else {
      setIsPending(false);
      alert("Something went wrong. Please check the logs.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <ReceiptText className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Crab Invoice Entry
          </h1>
          <p className="text-muted-foreground">
            Add invoices for docks and wholesalers.
          </p>
        </div>
      </div>

      {/* Input Card */}
      <Card className="border-2 border-primary/20 bg-card/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 items-end">
            <div className="space-y-2">
              <Label>Source Type</Label>
              <Select
                value={selectedType}
                onValueChange={(v: "Dock" | "Wholesaler") => {
                  setSelectedType(v);
                  setSelectedDist("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Source Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dock">Louisiana Dock</SelectItem>
                  <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Distributor</Label>
              <Select value={selectedDist} onValueChange={setSelectedDist}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {availableDistributors.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{`Boxes of 1's`}</Label>
              <Input
                type="number"
                value={ones}
                onChange={(e) => setOnes(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>{`Boxes of 2's`}</Label>
              <Input
                type="number"
                value={twos}
                onChange={(e) => setTwos(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label>Females</Label>
              <Input
                type="number"
                value={females}
                onChange={(e) => setFemales(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>
          </div>
          <Button
            onClick={addEntry}
            disabled={!selectedDist}
            className="w-full mt-6 bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> ADD INVOICE TO LIST
          </Button>
        </CardContent>
      </Card>

      {/* List Queue */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-foreground">
          Current Invoices{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({entries.length})
          </span>
        </h2>

        {entries.length === 0 && !isSuccess ? (
          <div className="py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground bg-muted/10 animate-in fade-in">
            No invoices added to the queue yet.
          </div>
        ) : (
          <div className="grid gap-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm animate-in slide-in-from-right-2"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "p-2 rounded-full",
                      entry.type === "Dock"
                        ? "bg-blue-500/10 text-blue-500"
                        : "bg-purple-500/10 text-purple-500",
                    )}
                  >
                    {entry.type === "Dock" ? (
                      <Truck className="h-5 w-5" />
                    ) : (
                      <Warehouse className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">
                      {entry.distributor}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">
                      {entry.type}
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 items-center">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{`1's`}</p>
                    <p className="font-mono font-bold text-blue-500">
                      {entry.ones}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{`2's`}</p>
                    <p className="font-mono font-bold text-orange-500">
                      {entry.twos}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Females</p>
                    <p className="font-mono font-bold text-pink-500">
                      {entry.females}
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-8" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEntry(entry.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* REFACTORED SUCCESS/SUBMIT AREA */}
      <div className="min-h-[80px]">
        {isSuccess ? (
          <div className="w-full h-24 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center gap-4 text-emerald-500 animate-in zoom-in-95 duration-300">
            <CheckCircle2 className="h-10 w-10" />
            <div className="text-left">
              <p className="text-xl font-bold">Invoices Logged Successfully!</p>
              <p className="text-sm opacity-80">
                All records have been sent to the spreadsheet.
              </p>
            </div>
          </div>
        ) : (
          entries.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full h-14 text-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 animate-in slide-in-from-bottom-4"
              size="lg"
            >
              {isPending ? (
                <Loader2 className="animate-spin mr-2 h-6 w-6" />
              ) : (
                "FINISH & SUBMIT ALL INVOICES"
              )}
            </Button>
          )
        )}
      </div>
    </div>
  );
}
