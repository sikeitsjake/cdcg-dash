import { cookies } from "next/headers";
import TuesdayBreakdown from "./tues-breakdown-form";

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  // Get the name from the cookie
  const userName = session?.value || "";

  return <TuesdayBreakdown initialWorker={userName} />;
}
