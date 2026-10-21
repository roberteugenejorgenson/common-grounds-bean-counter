import { NextResponse } from "next/server";
import { readStoredEntries } from "../../../lib/data-store";

export const dynamic = "force-dynamic";
const MONTHLY_REVENUE_GOAL = 50000;

export async function GET() {
  try {
    const entries = await readStoredEntries();
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
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not calculate summary." }, { status: 500 });
  }
}
