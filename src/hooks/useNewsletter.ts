import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY!
);

export const useNewsletter = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const subscribe = async (email: string, name?: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke(
        "newsletter-subscribe",
        {
          body: { email, name, source: "website" },
        }
      );

      if (error) throw error;

      setSuccess(true);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.functions.invoke(
        "newsletter-unsubscribe",
        {
          body: { email },
        }
      );

      if (error) throw error;

      setSuccess(true);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unsubscribe failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const trackEvent = async (
    campaignId: string,
    event: string,
    subscriberId: string,
    eventData?: any
  ) => {
    try {
      await supabase.functions.invoke("newsletter-analytics", {
        body: { campaignId, event, subscriberId, eventData },
      });
    } catch (err) {
      console.error("Failed to track event:", err);
    }
  };

  return {
    subscribe,
    unsubscribe,
    trackEvent,
    loading,
    error,
    success,
  };
};
