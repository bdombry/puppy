import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const EXPO_API_URL = "https://exp.host/--/api/v2/push/send";

// PUPPY_PRESETS matching the app
const PUPPY_PRESETS = {
  young: { label: "🐶 2-3 mois", interval: 2 },
  medium: { label: "🐕 4-6 mois", interval: 3 },
  older: { label: "🐕‍🦺 6+ mois", interval: 4 },
};

const DEFAULT_SETTINGS = {
  preset: "medium",
  excludedRanges: [{ start: "00:00", end: "08:00" }],
};

// Helper: Convert "HH:MM" to minutes since midnight
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

// Helper: Check if time is in excluded range
const isInExcludedRange = (hour: number, minute: number, excludedRanges: any[]): boolean => {
  const currentMinutes = hour * 60 + minute;

  for (const range of excludedRanges) {
    const startMinutes = timeToMinutes(range.start);
    const endMinutes = timeToMinutes(range.end);

    if (startMinutes < endMinutes) {
      if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
        return true;
      }
    } else {
      if (currentMinutes >= startMinutes || currentMinutes < endMinutes) {
        return true;
      }
    }
  }

  return false;
};

// Helper: Get next valid time (skip excluded ranges)
const getNextValidTime = (date: Date, excludedRanges: any[]): Date => {
  let currentDate = new Date(date);
  let attempts = 0;

  while (attempts < 1440) {
    const hour = currentDate.getHours();
    const minute = currentDate.getMinutes();

    if (!isInExcludedRange(hour, minute, excludedRanges)) {
      return currentDate;
    }

    currentDate.setMinutes(currentDate.getMinutes() + 1);
    attempts++;
  }

  return currentDate;
};

serve(async (req) => {
  try {
    // Only accept POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

    const { outing, user_id, dog_name } = await req.json();

    console.log(`📤 Processing outing for user ${user_id}, dog: ${dog_name}`);

    // Get user's notification settings
    const { data: settingsData, error: settingsError } = await supabase
      .from("profile_settings")
      .select("notification_settings")
      .eq("user_id", user_id)
      .single();

    let settings = DEFAULT_SETTINGS;
    if (settingsData?.notification_settings) {
      settings = settingsData.notification_settings;
    }

    const preset = (PUPPY_PRESETS as any)[settings.preset];
    if (!preset) {
      console.error("Invalid preset:", settings.preset);
      return new Response(JSON.stringify({ error: "Invalid preset" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate next notification time
    const outingTime = new Date(outing.datetime);
    const nextNotifTime = new Date(outingTime);
    nextNotifTime.setHours(nextNotifTime.getHours() + preset.interval);

    // Check excluded ranges
    const validTime = getNextValidTime(nextNotifTime, settings.excludedRanges);

    // Get user's push token
    const { data: tokenData, error: tokenError } = await supabase
      .from("push_tokens")
      .select("token")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!tokenData?.token) {
      console.log("⚠️ No push token found for user:", user_id);
      return new Response(JSON.stringify({ message: "No push token" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate delay until notification time
    const now = new Date();
    const delayMs = validTime.getTime() - now.getTime();

    if (delayMs <= 0) {
      console.log("⏭️ Notification time already passed, skipping");
      return new Response(JSON.stringify({ message: "Time passed" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Schedule notification via Expo
    const response = await fetch(EXPO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        to: tokenData.token,
        sound: "default",
        title: `${dog_name} 🐶`,
        body: "C'est l'heure de sortir !",
        data: {
          dog_name: dog_name,
          user_id: user_id,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Expo API error:", error);
      return new Response(JSON.stringify({ error: "Expo API error", details: error }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`✅ Notification scheduled in ${Math.floor(delayMs / 1000 / 60)} minutes`);

    return new Response(JSON.stringify({ success: true, delayMs }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
