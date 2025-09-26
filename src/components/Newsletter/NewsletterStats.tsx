import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

interface NewsletterStatsProps {
  campaignId?: string;
}

export const NewsletterStats: React.FC<NewsletterStatsProps> = ({
  campaignId,
}) => {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    openRate: 0,
    clickRate: 0,
    totalCampaigns: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [campaignId]);

  const fetchStats = async () => {
    try {
      // Get subscriber count
      const { count: subscriberCount } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get campaign count
      const { count: campaignCount } = await supabase
        .from("newsletter_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent");

      let openRate = 0;
      let clickRate = 0;

      if (campaignId) {
        // Get campaign-specific analytics
        const { data: analytics } = await supabase
          .from("newsletter_analytics")
          .select("event_type")
          .eq("campaign_id", campaignId);

        if (analytics && analytics.length > 0) {
          const opens = analytics.filter(
            (a) => a.event_type === "opened"
          ).length;
          const clicks = analytics.filter(
            (a) => a.event_type === "clicked"
          ).length;
          const sent = analytics.filter((a) => a.event_type === "sent").length;

          openRate = sent > 0 ? (opens / sent) * 100 : 0;
          clickRate = sent > 0 ? (clicks / sent) * 100 : 0;
        }
      } else {
        // Get overall analytics
        const { data: recentCampaigns } = await supabase
          .from("newsletter_campaigns")
          .select("id")
          .eq("status", "sent")
          .order("sent_at", { ascending: false })
          .limit(5);

        if (recentCampaigns && recentCampaigns.length > 0) {
          const campaignIds = recentCampaigns.map((c) => c.id);

          const { data: analytics } = await supabase
            .from("newsletter_analytics")
            .select("event_type")
            .in("campaign_id", campaignIds);

          if (analytics && analytics.length > 0) {
            const opens = analytics.filter(
              (a) => a.event_type === "opened"
            ).length;
            const clicks = analytics.filter(
              (a) => a.event_type === "clicked"
            ).length;
            const sent = analytics.filter(
              (a) => a.event_type === "sent"
            ).length;

            openRate = sent > 0 ? (opens / sent) * 100 : 0;
            clickRate = sent > 0 ? (clicks / sent) * 100 : 0;
          }
        }
      }

      setStats({
        totalSubscribers: subscriberCount || 0,
        openRate,
        clickRate,
        totalCampaigns: campaignCount || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='bg-white p-4 rounded-lg border animate-pulse'>
            <div className='h-4 bg-gray-200 rounded mb-2'></div>
            <div className='h-8 bg-gray-200 rounded'></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <div className='bg-white p-4 rounded-lg border'>
        <p className='text-sm text-gray-600 mb-1'>Subscribers</p>
        <p className='text-2xl font-bold text-gray-900'>
          {stats.totalSubscribers.toLocaleString()}
        </p>
      </div>

      <div className='bg-white p-4 rounded-lg border'>
        <p className='text-sm text-gray-600 mb-1'>Open Rate</p>
        <p className='text-2xl font-bold text-gray-900'>
          {stats.openRate.toFixed(1)}%
        </p>
      </div>

      <div className='bg-white p-4 rounded-lg border'>
        <p className='text-sm text-gray-600 mb-1'>Click Rate</p>
        <p className='text-2xl font-bold text-gray-900'>
          {stats.clickRate.toFixed(1)}%
        </p>
      </div>

      <div className='bg-white p-4 rounded-lg border'>
        <p className='text-sm text-gray-600 mb-1'>Campaigns Sent</p>
        <p className='text-2xl font-bold text-gray-900'>
          {stats.totalCampaigns}
        </p>
      </div>
    </div>
  );
};
