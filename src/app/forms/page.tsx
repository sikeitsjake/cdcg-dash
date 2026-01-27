import FormsPage from "./form-hub";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");
  const userName = session?.value || "Guest";

  return <FormsPage userName={userName} />;
}
