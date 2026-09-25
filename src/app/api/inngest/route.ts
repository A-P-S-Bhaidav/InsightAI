import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { runAgenticTask } from "@/lib/inngest/functions";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runAgenticTask
  ],
});
