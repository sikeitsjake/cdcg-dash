import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getLatestStockData } from "@/lib/actions/crab-actions";
import { format, subMinutes, setHours, setMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";

// --- HELPERS (Kept exactly as is) ---
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
  } catch (e) {
    return null;
  }
}

function getWeatherDetails(code: number) {
  if (code === 0) return { label: "Clear Skies", icon: Sun };
  if (code <= 3) return { label: "Partly Cloudy", icon: CloudSun };
  if (code <= 67) return { label: "Rainy", icon: CloudRain };
  return { label: "Cloudy", icon: Cloud };
}

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

function getStartTime(
  totalDozens: number,
  ungradedBoxes: number,
  dateContext: Date = new Date(),
) {
  // 1. Consistency: Convert to Eastern Time
  const estDate = new Date(
    dateContext.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const currentHour = estDate.getHours();

  // 2. Target Day Logic
  const targetDate = new Date(estDate);
  if (currentHour >= 17) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const dayName = format(targetDate, "EEEE");
  const weekDays = ["Wednesday", "Thursday", "Friday"];
  const weekendDays = ["Saturday", "Sunday"];

  if (dayName === "Monday" || dayName === "Tuesday")
    return { time: "Closed", forDay: dayName };

  // 3. Set LATEST Start Time (The "Baseline")
  // We'll calculate BACKWARDS from 2 hours after the opening base hour
  let latestHour = 0;
  if (weekDays.includes(dayName)) latestHour = 14; // 2:00 PM (12PM + 2hrs)
  if (weekendDays.includes(dayName)) latestHour = 11; // 11:00 AM (9AM + 2hrs)

  if (latestHour === 0) return { time: "N/A", forDay: dayName };

  // 4. Calculate Total Work Minutes
  // 5 mins per 8.5 dozen
  const dozenMinutes = (totalDozens / 8.5) * 5;
  // 5 mins per ungraded box
  const boxMinutes = ungradedBoxes * 5;

  const totalWorkMinutes = dozenMinutes + boxMinutes;

  // 5. Apply Math to the Baseline
  // We start at the "Latest" time and subtract the work required
  const calculationTime = setMinutes(
    setHours(new Date(targetDate), latestHour),
    0,
  );
  const finalClockIn = subMinutes(calculationTime, totalWorkMinutes);

  // 6. Rounding to nearest 5 or 15 minutes (Optional but looks cleaner)
  // Let's round to the nearest 5-minute increment
  const minutes = finalClockIn.getMinutes();
  const roundedMinutes = Math.round(minutes / 5) * 5;
  finalClockIn.setMinutes(roundedMinutes);

  return {
    time: format(finalClockIn, "h:mm a"),
    forDay: dayName,
    isTomorrow: targetDate.getDate() !== estDate.getDate(),
    stats: {
      dozenMins: Math.round(dozenMinutes),
      boxMins: boxMinutes,
      totalWorkLoad: Math.round(totalWorkMinutes),
    },
  };
}

// --- SUB-COMPONENTS FOR STREAMING ---

async function WeatherWidget() {
  const weatherData = await getWeatherData();
  const current = weatherData?.current;
  const daily = weatherData?.daily;
  const weatherDetail = current
    ? getWeatherDetails(current.weather_code)
    : null;
  const WeatherIcon = weatherDetail?.icon || CloudSun;

  return (
    <Card className="md:col-span-4 border-2 border-blue-500/20 bg-blue-500/5 animate-in fade-in duration-1000">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs md:text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 uppercase">
          <ThermometerSun className="h-4 w-4" /> Local Forecast
        </CardTitle>
        <CardDescription className="text-blue-600/60 text-[10px] md:text-xs">
          Last Updated: {weatherData?.fetchedAt || "N/A"}
        </CardDescription>
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
                <Sunset className="h-3.5 w-3.5" /> {formatTime(daily.sunset[0])}
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
  );
}

async function StockAndScheduleSection({
  currentServerDate,
}: {
  currentServerDate: Date;
}) {
  const stock = await getLatestStockData();
  const totalDozens = stock ? stock.totalMales + stock.totalFemales : 0;
  const ungradedBoxes = stock ? stock.ungraded : 0;
  const recommendedStartTime = getStartTime(
    totalDozens,
    ungradedBoxes,
    currentServerDate,
  );

  return (
    <>
      {/* Schedule Banner */}
      <Card className="border-2 border-primary/10 bg-card/50 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="px-6 py-1.5 border-b border-primary/5 bg-primary/5 flex justify-between items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
            Estimated Back of House Clock in Time
          </p>
          <Badge
            variant="outline"
            className="text-[9px] h-4 border-primary/20 bg-primary/5 text-primary"
          >
            {recommendedStartTime.isTomorrow ? "Tomorrow" : "Today"}
          </Badge>
        </div>

        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Stats Group */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border bg-card text-card-foreground shadow-sm flex-1">
            <div className="space-y-1">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Estimated Dozens to Run
              </p>
              <h2 className="text-foreground text-lg font-black leading-none">
                {totalDozens}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  Dozens
                </span>
              </h2>
            </div>
            <div className="space-y-1 border-l pl-4">
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Boxes to Grade
              </p>
              <h2 className="text-foreground text-lg font-black leading-none">
                {ungradedBoxes}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  Boxes
                </span>
              </h2>
            </div>
          </div>

          {/* Time Group - Icon moved here */}
          <div className="flex flex-col md:items-end justify-center gap-1">
            <p className="text-muted-foreground text-[9px] font-bold uppercase tracking-widest">
              Estimated Clock In:
            </p>
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />{" "}
              {/* Icon is now right in front of time */}
              <p className="text-xl md:text-2xl font-black tabular-nums">
                {recommendedStartTime.time}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:gap-6 md:grid-cols-12">
        <Suspense fallback={<WeatherFallback />}>
          <WeatherWidget />
        </Suspense>

        {/* Main Stock Widget */}
        <Card className="md:col-span-8 border-2 border-primary/10 bg-card/50 animate-in fade-in duration-500">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-xl md:text-2xl font-black flex items-center gap-2">
                <Warehouse className="h-5 w-5 md:h-6 md:w-6 text-primary" />{" "}
                Current Stock
              </CardTitle>
              <CardDescription className="text-[10px] md:text-sm">
                Latest Report: {stock?.date || "No data available"}
              </CardDescription>
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
                    <p className="text-[9px] md:text-xs font-black text-blue-600 uppercase">
                      Males
                    </p>
                    <p className="text-2xl md:text-4xl font-black">
                      {stock.totalMales}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] md:text-xs font-black text-pink-600 uppercase">
                      Females
                    </p>
                    <p className="text-2xl md:text-4xl font-black">
                      {stock.totalFemales}
                    </p>
                  </div>
                  <div className="space-y-0.5 col-span-2 md:col-span-1 border-t md:border-t-0 pt-4 md:pt-0">
                    <p className="text-[9px] md:text-xs font-black text-orange-600 uppercase">
                      Bushels
                    </p>
                    <p className="text-2xl md:text-4xl font-black">
                      {stock.totalBushels}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground text-xs font-bold uppercase">
                Waiting for inventory report...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Fallbacks to keep the layout from jumping
function WeatherFallback() {
  return (
    <Card className="md:col-span-4 h-75 animate-pulse bg-muted/20 border-2 border-primary/10" />
  );
}

function StockFallback() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="h-32 animate-pulse bg-muted/20 border-2 border-primary/10" />
      <Card className="h-64 animate-pulse bg-muted/20 border-2 border-primary/10" />
    </div>
  );
}

// --- MAIN PAGE ---
export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  if (!session) redirect("/login");

  const now = new Date();

  return (
    <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-0 animate-in slide-in-from-bottom-4 duration-700">
      {/* HEADER CARD - Loads Instantly */}
      <Card className="border-2 border-primary/10">
        <CardHeader className="flex flex-row items-center gap-4 md:gap-5 py-6 md:py-8">
          <div className="h-12 w-12 md:h-16 md:w-16 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xl">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8" />
          </div>
          <div>
            <p className="text-[10px] md:text-sm font-semibold uppercase tracking-wider text-primary">
              {`Captain Dick's Dashboard`}
            </p>
            <CardTitle className="text-xl md:text-4xl font-black">
              Ready to roll,{" "}
              <span className="text-primary">{session.value}</span>?
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* STREAMED CONTENT */}
      <Suspense fallback={<StockFallback />}>
        <StockAndScheduleSection currentServerDate={now} />
      </Suspense>
    </div>
  );
}
