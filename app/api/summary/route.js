import { NextResponse } from "next/server";
import { readEntries } from "../../../lib/entries";

export const dynamic = "force-dynamic";
const MONTHLY_REVENUE_GOAL = 50000;

export async function GET() {
  try {
    const entries = await readEntries();
    if (!entries.length) return NextResponse.json({ drinks_latest_week: 0, revenue_latest_week: 0, goal_progress_pct: 0, by_location: [] });
    const latestWeek = entries.reduce((latest, entry) => entry.week_of > latest ? entry.week_of : latest, "");
    const latest = entries.filter((entry) => entry.week_of === latestWeek);
    const latestMonth = latestWeek.slice(0, 7);
    const monthlyRevenue = entries.filter((entry) => entry.week_of.startsWith(latestMonth)).reduce((sum, entry) => sum + entry.revenue, 0);
    const by_location = latest.map(({ location, revenue }) => ({ location, revenue }));
    return NextResponse.json({
      drinks_latest_week: latest.reduce((sum, entry) => sum + entry.drinks_sold, 0),
      revenue_latest_week: latest.reduce((sum, entry) => sum + entry.revenue, 0),
      goal_progress_pct: Math.round((monthlyRevenue / MONTHLY_REVENUE_GOAL) * 100),
      by_location,
    });
  } catch {
    return NextResponse.json({ error: "Could not calculate summary." }, { status: 500 });
  }
}
