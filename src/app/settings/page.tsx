"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Monitor, User, Type, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("display");
  const { theme, setTheme } = useTheme();

  const categories = [
    { id: "account", label: "Account", icon: User },
    { id: "display", label: "Display", icon: Monitor },
    { id: "text-size", label: "Text Size", icon: Type },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="space-y-0.5">
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Settings
        </h2>
        <p className="text-muted-foreground">
          Manage your dashboard preferences and account settings.
        </p>
      </div>

      <Separator className="bg-border/60" />

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Secondary Sidebar */}
        <aside className="lg:w-48 flex-shrink-0">
          <nav className="flex flex-row overflow-x-auto pb-2 lg:pb-0 lg:flex-col gap-1.5">
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === item.id
                    ? "bg-primary/10 text-primary dark:bg-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4 transition-colors",
                    activeTab === item.id
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <div className="flex-1">
          {activeTab === "display" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">Display</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Customize the visual interface of your workspace.
                </p>
              </div>

              <div className="grid gap-4">
                {/* Theme Toggle Card */}
                <div className="group relative flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md dark:bg-zinc-900/50 dark:hover:bg-zinc-900">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-background">
                      {theme === "dark" ? (
                        <Moon className="h-5 w-5 text-indigo-400" />
                      ) : (
                        <Sun className="h-5 w-5 text-amber-500" />
                      )}
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold">
                        Dark Mode
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Current theme:{" "}
                        <span className="capitalize text-primary font-medium">
                          {theme}
                        </span>
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) =>
                      setTheme(checked ? "dark" : "light")
                    }
                    className="data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" || activeTab === "text-size" ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed bg-muted/30 text-center animate-in fade-in duration-700">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
              </div>
              <p className="text-sm font-medium text-muted-foreground italic">
                Coming soon: {categories.find((c) => c.id === activeTab)?.label}{" "}
                Settings
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
