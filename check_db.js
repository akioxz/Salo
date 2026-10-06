import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

async function main() {
  try {
    // We can't query households directly if it's protected by auth,
    // but we can check if it works.
    console.log("Checking Convex URL:", process.env.NEXT_PUBLIC_CONVEX_URL);
  } catch (err) {
    console.error(err);
  }
}
main();
