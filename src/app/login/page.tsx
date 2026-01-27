"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Delete } from "lucide-react";
import { loginWithPin } from "@/lib/actions/auth-actions";

// 1. Move the logic into a component that can access SearchParams
function PinLoginCard() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Grab the 'callbackUrl' from the URL, or default to root "/"
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePress = (val: string) => {
    setError("");
    if (pin.length < 4) setPin((prev) => prev + val);
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    setIsPending(true);
    const result = await loginWithPin(pin);

    if (result.success) {
      // Redirect to the place they were trying to go
      router.push(callbackUrl);
    } else {
      setIsPending(false);
      setError("Invalid PIN. Please try again.");
      setPin("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pin.length === 4) {
      handleSubmit();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      handleDelete();
    } else if (e.key === "Escape") {
      setPin("");
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4 transition-colors duration-500"
      onClick={() => inputRef.current?.focus()}
    >
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const val = e.target.value.replace(/\D/g, "").slice(0, 4);
          setPin(val);
          setError("");
        }}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none"
        autoFocus
      />

      <Card className="w-full max-w-md border-border bg-card shadow-2xl transition-all duration-300">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-2">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold tracking-tight text-foreground">
              Team Portal
            </CardTitle>
            <p className="text-sm font-medium text-muted-foreground">
              Enter your 4-digit PIN to login.
            </p>
          </div>

          <div className="flex justify-center gap-3 py-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`h-14 w-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                  pin.length > i
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] scale-105"
                    : "border-input bg-muted/30 text-transparent"
                } ${error ? "border-destructive text-destructive animate-bounce" : ""}`}
              >
                {pin[i] ? "•" : ""}
              </div>
            ))}
          </div>
          {error && (
            <p className="text-destructive text-sm font-semibold animate-in fade-in slide-in-from-top-1">
              {error}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <Button
                key={num}
                variant="outline"
                className="h-16 text-2xl font-bold border-input text-foreground hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePress(num);
                }}
                disabled={isPending}
              >
                {num}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="h-16 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isPending || pin.length === 0}
            >
              <Delete className="h-7 w-7" />
            </Button>
            <Button
              variant="outline"
              className="h-16 text-2xl font-bold border-input text-foreground hover:bg-accent active:scale-95 shadow-sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePress("0");
              }}
              disabled={isPending}
            >
              0
            </Button>
            <Button
              variant="default"
              className="h-16 text-lg font-black shadow-lg shadow-primary/20 active:scale-95 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                handleSubmit();
              }}
              disabled={isPending || pin.length !== 4}
            >
              {isPending ? <Loader2 className="animate-spin" /> : "LOG IN"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 2. Export with Suspense to prevent Next.js build errors
export default function PinLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <PinLoginCard />
    </Suspense>
  );
}
