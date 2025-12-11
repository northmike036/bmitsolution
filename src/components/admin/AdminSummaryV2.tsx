"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";

type Metric = {
  label: string;
  value: number;
};

type CalendarRange = {
  from: Date;
  to?: Date;
} | null;

type AnalyticsResponse = {
  totalPosts: number;
  deletedPosts: number;
  availablePosts: number;
  dailyClaims: number;
  fbLeads: number;
  clLeads: number;
};

interface RangeSectionProps {
  title: string;
  data: Metric[];
}

export default function AnalyticsDashboard() {
  const [customDate, setCustomDate] = useState<CalendarRange | null>(null);
  const [activeTab, setActiveTab] = useState("daily");
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  const fetchData = async (range: string, from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (range) params.set("range", range);

    const res = await fetch(
      `/api/admin/dashboard/analytics?${params.toString()}`,
    );
    const json = await res.json();
    console.log(json);
    setData(json);
  };

  useEffect(() => {
    if (activeTab !== "custom") {
      fetchData(activeTab);
    } else if (customDate?.from) {
      const fromISO = customDate.from.toISOString();
      const toISO = (customDate.to || customDate.from).toISOString(); // single date fix
      fetchData("custom", fromISO, toISO);
    }
  }, [activeTab, customDate]);

  const metrics = data
    ? [
        { label: "Leads", value: data.totalPosts },
        { label: "Deleted Leads", value: data.deletedPosts },
        { label: "Available Leads", value: data.availablePosts },
        { label: "Claim", value: data.dailyClaims },
        { label: "Fb Leads", value: data.fbLeads },
        { label: "CL Leads", value: data.clLeads },
      ]
    : [];

  return (
    <div className="flex w-full flex-col gap-6 p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted grid grid-cols-5 gap-2 rounded-xl p-2">
          {["daily", "weekly", "monthly", "lastMonth", "custom"].map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {["daily", "weekly", "monthly", "lastMonth"].map((range) => (
          <TabsContent key={range} value={range} className="mt-6">
            <RangeSection
              title={`${range.charAt(0).toUpperCase() + range.slice(1)} Insights`}
              data={metrics}
            />
          </TabsContent>
        ))}

        <TabsContent value="custom" className="mt-6">
          <div className="flex flex-col gap-6">
            <Calendar
              mode="range"
              selected={customDate || undefined}
              onSelect={(selected) => {
                if (!selected || !selected.from) {
                  setCustomDate(null);
                } else {
                  // selected.to may be undefined for a single date
                  setCustomDate({ from: selected.from, to: selected.to });
                }
              }}
              className="rounded-xl border p-3"
            />
            {customDate?.from ? (
              <RangeSection
                title={`Data for ${customDate.from.toLocaleDateString()}${customDate.to ? ` → ${customDate.to.toLocaleDateString()}` : ""}`}
                data={metrics}
              />
            ) : (
              <p className="text-gray-600">
                Select a date or range to view insights.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RangeSection({ title, data }: RangeSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {data.length > 0 ? (
          data.map((item, idx) => (
            <Card key={idx} className="rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-gray-500">{item.label}</p>
                <p className="mt-1 text-xl font-semibold">{item.value}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
