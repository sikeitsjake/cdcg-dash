import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Sparkles,
  CloudSun,
  ThermometerSun,
  Sun,
  Cloud,
  CloudRain,
  ArrowUp,
  ArrowDown,
  Sunrise,
  Sunset,
  Warehouse,
  Clock,
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLatestStockData } from "@/lib/actions/crab-actions";

const LAT = process.env.LAT;
const LON = process.env.LON;

async function getWeatherData() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York`,
      { next: { revalidate: 600 } },
    );
    const data = await res.json();
    return {
      ...data,
      fetchedAt: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "America/New_York",
      }),
    };
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

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Logic to determine employee start time based on inventory volume
function getStartTime(totalDozens: number, currentDay: string) {
  const weekDays = ["Wednesday", "Thursday", "Friday"];
  const weekendDays = ["Saturday", "Sunday"];

  // 1. Quick exit for closed days
  if (currentDay === "Monday" || currentDay === "Tuesday") return "Closed";

  // 2. Identify the starting hour (12 PM for weekdays, 9 AM for weekends)
  let baseHour;
  if (weekDays.includes(currentDay)) {
    baseHour = 12;
  } else if (weekendDays.includes(currentDay)) {
    baseHour = 9;
  } else {
    return "N/A"; // Fallback for unknown days
  }

  // Formatting functions that format 24hr time -> 12hr time.
  const format12h = (h: number) => (h > 12 ? h - 12 : h);
  const getSuffix = (h: number) => (h >= 12 ? " PM" : " AM");

  // 3. One logic path for all volumes
  if (totalDozens >= 300)
    return `${format12h(baseHour)}:00${getSuffix(baseHour)}`;
  if (totalDozens >= 250)
    return `${format12h(baseHour)}:30${getSuffix(baseHour)}`;
  if (totalDozens >= 200)
    return `${format12h(baseHour)}:45${getSuffix(baseHour)}`;

  // For lower volumes (+1 hour)
  const hourPlus1 = baseHour + 1;
  if (totalDozens >= 150)
    return `${format12h(hourPlus1)}:00${getSuffix(hourPlus1)}`;
  if (totalDozens >= 100)
    return `${format12h(hourPlus1)}:30${getSuffix(hourPlus1)}`;
  if (totalDozens >= 90)
    return `${format12h(hourPlus1)}:45${getSuffix(hourPlus1)}`;

  // Default (+2 hours)
  const hourPlus2 = baseHour + 2;
  return `${format12h(hourPlus2)}:00${getSuffix(hourPlus2)}`;
}

// COMPONENT
export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) redirect("/login");

  const [weatherData, stock] = await Promise.all([
    getWeatherData(),
    getLatestStockData(),
  ]);

  // 2. Define your "Global" Time Reference for this request
  const now = new Date();
  const todayEST = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/New_York",
  }).format(now);

  const current = weatherData?.current;
  const daily = weatherData?.daily;
  const weatherDetail = current
    ? getWeatherDetails(current.weather_code)
    : null;
  const WeatherIcon = weatherDetail?.icon || CloudSun;

  const totalDozens = stock ? stock.totalMales + stock.totalFemales : 0;
  const recommendedStartTime = getStartTime(totalDozens, todayEST);

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-0 transition-opacity duration-500 ease-in">
      {/* HEADER CARD */}
      <Card className="bg-gradient-to-r from-blue-600/10 via-transparent to-transparent border-2 border-primary/10 overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-4 md:gap-5 py-6 md:py-8">
          <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center rounded-xl md:rounded-2xl bg-primary text-primary-foreground shadow-xl shrink-0">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] md:text-sm font-semibold uppercase tracking-wider text-primary truncate">
              Store Dashboard
            </p>
            <CardTitle className="text-xl md:text-4xl font-black tracking-tight leading-tight">
              Ready to roll,{" "}
              <span className="text-primary">{session.value}</span>?
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* REFINED EMPLOYEE SCHEDULE BANNER */}
      <Card className="border-2 border-primary/10 bg-card/50 shadow-sm overflow-hidden">
        {/* TITLE SECTION */}
        <div className="px-6 py-1.5 border-b border-primary/5 bg-primary/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
            Estimated Back of House Clock in Time
          </p>
        </div>

        {/* CONTENT SECTION */}
        <div className="px-6 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-lg">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">
                Estimated Total Dozen
              </p>
              <h2 className="text-foreground text-sm md:text-base font-black">
                {totalDozens} Dozens Total
              </h2>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 md:gap-0 border-t md:border-t-0 pt-2 md:pt-0 border-primary/5">
            <p className="text-muted-foreground text-[9px] font-bold uppercase">
              Estimated Clock In Time:
            </p>
            <p className="text-primary text-lg md:text-xl font-black">
              {recommendedStartTime}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:gap-6 md:grid-cols-12">
        {/* WEATHER WIDGET */}
        <Card className="md:col-span-4 border-2 border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 uppercase">
                <ThermometerSun className="h-4 w-4" /> Local Forecast
              </CardTitle>
              <CardDescription className="text-blue-600/60 text-[10px] md:text-xs">
                Last Updated: {weatherData?.fetchedAt || "N/A"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {current && daily ? (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl md:text-5xl font-black tracking-tighter">
                      {Math.round(current.temperature_2m)}°
                    </div>
                    <p className="text-[10px] md:text-sm font-bold text-blue-600/80 uppercase">
                      Feels Like: {Math.round(current.apparent_temperature)}°
                    </p>
                  </div>
                  <WeatherIcon className="h-10 w-10 md:h-14 md:w-14 text-blue-500" />
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-blue-500/10 pt-4">
                  <div className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">
                        High
                      </p>
                      <p className="text-xs md:text-sm font-black">
                        {Math.round(daily.temperature_2m_max[0])}°F
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-blue-400" />
                    <div>
                      <p className="text-[9px] uppercase font-bold text-muted-foreground">
                        Low
                      </p>
                      <p className="text-xs md:text-sm font-black">
                        {Math.round(daily.temperature_2m_min[0])}°F
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground bg-blue-500/10 p-2 md:p-3 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Sunrise className="h-3.5 w-3.5" />{" "}
                    {formatTime(daily.sunrise[0])}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sunset className="h-3.5 w-3.5" />{" "}
                    {formatTime(daily.sunset[0])}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Unable to load weather
              </div>
            )}
          </CardContent>
        </Card>

        {/* MAIN STOCK WIDGET */}
        <Card className="md:col-span-8 border-2 border-primary/10 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex flex-row items-start justify-between gap-2">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-xl md:text-2xl font-black flex items-center gap-2">
                  <Warehouse className="h-5 w-5 md:h-6 md:w-6 text-primary" />{" "}
                  Current Stock
                </CardTitle>
                <CardDescription className="text-[10px] md:text-sm">
                  Latest Report: {stock?.date || "No data available"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stock ? (
              <div className="flex flex-col gap-4 md:gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl md:text-7xl font-black tracking-tighter text-primary">
                    {totalDozens}
                  </span>
                  <span className="text-sm md:text-2xl font-bold text-muted-foreground uppercase">
                    Dozens Total
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 pt-6 border-t border-primary/5">
                  <div className="space-y-0.5">
                    <p className="text-[9px] md:text-xs font-black text-blue-600 uppercase tracking-widest">
                      Males
                    </p>
                    <p className="text-2xl md:text-4xl font-black">
                      {stock.totalMales}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">
                      ALL MALES
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] md:text-xs font-black text-pink-600 uppercase tracking-widest">
                      Females
                    </p>
                    <p className="text-2xl md:text-4xl font-black">
                      {stock.totalFemales}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">
                      ALL FEMALES
                    </p>
                  </div>
                  <div className="space-y-0.5 col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
                    <p className="text-[9px] md:text-xs font-black text-orange-600 uppercase tracking-widest">
                      Bushels
                    </p>
                    <p className="text-2xl md:text-4xl font-black">
                      {stock.totalBushels}
                    </p>
                    <p className="text-[8px] md:text-[10px] text-muted-foreground font-bold">
                      ALL #1 Bushels
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest">
                Waiting for inventory report...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
