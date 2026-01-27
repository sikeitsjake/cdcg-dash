import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Sparkles,
  CloudSun,
  ListTodo,
  CheckCircle2,
  AlertCircle,
  ThermometerSun,
  Wind,
  Activity,
  Cloud,
  Sun,
  CloudRain,
  ArrowUp,
  ArrowDown,
  Sunrise,
  Sunset,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { google } from "googleapis";
import { Warehouse } from "lucide-react";

const LAT = process.env.LAT;
const LON = process.env.LON;

async function getWeatherData() {
  try {
    // Adding 'apparent_temperature' for feels like and 'daily' for high/low/sunset
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`,
      { next: { revalidate: 3600 } },
    );
    return await res.json();
  } catch (error) {
    console.error("Weather fetch failed:", error);
    return null;
  }
}

function getWeatherDetails(code: number) {
  if (code === 0) return { label: "Clear Skies", icon: Sun };
  if (code <= 3) return { label: "Partly Cloudy", icon: CloudSun };
  if (code <= 67) return { label: "Rainy", icon: CloudRain };
  return { label: "Cloudy", icon: Cloud };
}

// Simple helper to format ISO strings like "2026-01-27T17:15" to "5:15 PM"
const formatTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) redirect("/login");

  const weatherData = await getWeatherData();
  const current = weatherData?.current;
  const daily = weatherData?.daily;
  const weatherDetail = current
    ? getWeatherDetails(current.weather_code)
    : null;
  const WeatherIcon = weatherDetail?.icon || CloudSun;

  const dailyTasks = [
    { id: "1", task: "Calibrate Scales", done: true },
    { id: "2", task: "Check Maryland 1's Inventory", done: false },
    { id: "3", task: "Clean Steamer Trays", done: false },
    { id: "4", task: "Finalize Tuesday Logistics", done: false },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      <Card className="bg-gradient-to-r from-blue-600/10 via-transparent to-transparent border-2 border-primary/10">
        <CardHeader className="flex flex-row items-center gap-5 py-8">
          <div className="h-16 w-16 flex items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl rotate-3">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Store Dashboard
            </p>
            <CardTitle className="text-4xl font-black tracking-tight">
              Ready to roll, {session.value}?
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-12">
        {/* ENHANCED WEATHER WIDGET */}
        <Card className="md:col-span-4 border-2 border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 uppercase">
              <ThermometerSun className="h-4 w-4" /> Local Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            {current && daily ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-5xl font-black tracking-tighter">
                      {Math.round(current.temperature_2m)}°
                    </div>
                    <p className="text-sm font-bold text-blue-600/80 uppercase">
                      Feels like {Math.round(current.apparent_temperature)}°
                    </p>
                  </div>
                  <WeatherIcon className="h-14 w-14 text-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-blue-500/10 pt-4">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        High
                      </p>
                      <p className="text-sm font-black">
                        {Math.round(daily.temperature_2m_max[0])}°F
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Low
                      </p>
                      <p className="text-sm font-black">
                        {Math.round(daily.temperature_2m_min[0])}°F
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground bg-blue-500/10 p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="h-4 w-4" />{" "}
                    {formatTime(daily.sunrise[0])}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunset className="h-4 w-4" /> {formatTime(daily.sunset[0])}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                Unable to load weather
              </div>
            )}
          </CardContent>
        </Card>

        {/* DAILY TASKS */}
        <Card className="md:col-span-8 border-2 border-primary/5">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" /> Today's Priorities
              </CardTitle>
              <CardDescription>
                Store checks for {new Date().toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {dailyTasks.filter((t) => !t.done).length} Remaining
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-3">
            {dailyTasks.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-3 p-3 rounded-lg border bg-card/50"
              >
                <Checkbox id={item.id} checked={item.done} />
                <label
                  htmlFor={item.id}
                  className={`text-sm font-medium ${item.done ? "line-through text-muted-foreground" : ""}`}
                >
                  {item.task}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* STATS GRID */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Active Staff",
            val: "6",
            icon: Users,
            color: "text-green-500",
          },
          {
            title: "Inventory",
            val: "Stocked",
            icon: CheckCircle2,
            color: "text-blue-500",
          },
          {
            title: "Invoices",
            val: "3",
            icon: AlertCircle,
            color: "text-orange-500",
          },
          {
            title: "Logins",
            val: "12",
            icon: Activity,
            color: "text-purple-500",
          },
        ].map((item, i) => (
          <Card key={i} className="hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase text-muted-foreground">
                {item.title}
              </CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{item.val}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
