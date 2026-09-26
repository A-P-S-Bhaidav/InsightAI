import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { runAgenticTask } from "@/lib/inngest/functions";

// Vercel Hobby plan maximum duration (60 seconds)
export const maxDuration = 60;

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    runAgenticTask
  ],
});
