"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Example Schedule Data
const SCHEDULE_EVENTS = [
  {
    date: new Date(2026, 0, 24),
    title: "End of Pay Period",
    worker: "",
    type: "",
  },
];

export default function ScheduleView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Calendar logic helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            WORK IN PROGRESS: Team Schedule
          </h1>
          <p className="text-muted-foreground italic">
            {format(currentMonth, "MMMM yyyy")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <Card className="border-2 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/50">
          {weekDays.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 auto-rows-[120px]">
          {calendarDays.map((day, idx) => {
            const dayEvents = SCHEDULE_EVENTS.filter((event) =>
              isSameDay(event.date, day),
            );

            return (
              <div
                key={day.toString()}
                className={cn(
                  "p-2 border-r border-b transition-colors hover:bg-muted/30",
                  !isSameMonth(day, monthStart) &&
                    "bg-muted/20 text-muted-foreground/50",
                  isSameDay(day, new Date()) && "bg-primary/5",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-medium h-7 w-7 flex items-center justify-center rounded-full",
                    isSameDay(day, new Date()) &&
                      "bg-primary text-primary-foreground",
                  )}
                >
                  {format(day, "d")}
                </span>

                <div className="mt-2 space-y-1">
                  {dayEvents.map((event, eIdx) => (
                    <div key={eIdx} className="group relative">
                      <Badge
                        variant="secondary"
                        className="w-full justify-start truncate text-[10px] px-1.5 py-0 h-5 font-normal border-l-2 border-l-primary bg-primary/10 text-primary hover:bg-primary/20 cursor-default"
                      >
                        <Clock className="h-3 w-3 mr-1 opacity-50" />
                        {event.worker}: {event.title}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
