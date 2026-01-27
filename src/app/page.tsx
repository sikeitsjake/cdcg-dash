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
} from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLatestStockData } from "@/lib/actions/crab-actions";

const LAT = process.env.LAT;
const LON = process.env.LON;

async function getWeatherData() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`,
      { next: { revalidate: 600 } },
    );
    const data = await res.json();
    // Add a local timestamp for when this was fetched
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
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/New_York",
  });
};

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) redirect("/login");

  const [weatherData, stock] = await Promise.all([
    getWeatherData(),
    getLatestStockData(),
  ]);

  const current = weatherData?.current;
  const daily = weatherData?.daily;
  const weatherDetail = current
    ? getWeatherDetails(current.weather_code)
    : null;
  const WeatherIcon = weatherDetail?.icon || CloudSun;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 fill-mode-forwards will-change-transform">
      {/* HEADER CARD */}
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
        {/* WEATHER WIDGET (Left Column) */}
        <Card className="md:col-span-4 border-2 border-blue-500/20 bg-blue-500/5">
          <CardHeader className="pb-2">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400 uppercase">
                <ThermometerSun className="h-4 w-4" /> Local Forecast
              </CardTitle>
              {/* Added to match Stock widget style */}
              <CardDescription className="text-blue-600/60">
                Weather last fetched at: {weatherData?.fetchedAt || "N/A"}
              </CardDescription>
            </div>
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

        {/* MAIN STOCK WIDGET (Right Column) */}
        <Card className="md:col-span-8 border-2 border-primary/10 bg-card/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <Warehouse className="h-6 w-6 text-primary" /> Current Stock
              </CardTitle>
              <CardDescription>
                Last reported count: {stock?.date || "No data available"}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {stock ? (
              <div className="flex flex-col gap-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl font-black tracking-tighter text-primary">
                    {stock.totalMales + stock.totalFemales}
                  </span>
                  <span className="text-2xl font-bold text-muted-foreground uppercase">
                    Dozens Total
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-primary/5">
                  <div className="space-y-1">
                    <p className="text-xs font-black text-blue-600 uppercase tracking-widest">
                      Males
                    </p>
                    <p className="text-4xl font-black">{stock.totalMales}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      SM - SUPER
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-pink-600 uppercase tracking-widest">
                      Females
                    </p>
                    <p className="text-4xl font-black">{stock.totalFemales}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      SM - LG
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-orange-600 uppercase tracking-widest">
                      Bushels
                    </p>
                    <p className="text-4xl font-black">{stock.totalBushels}</p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      TOTAL VOLUME
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-muted-foreground font-bold uppercase tracking-widest">
                Waiting for inventory report...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
