"use client";

import { useEffect, useState } from "react";

const LOCATIONS = ["Downtown", "Uptown", "Design District", "Bishop Arts"];

const emptyForm = {
  week_of: "",
  location: "",
  drinks_sold: "",
  revenue: "",
  loyalty_signups: "",
  bags_sold: "",
  notes: "",
};

const SUBMIT_ERROR = "Something went wrong — the entry didn't save.";

function formatWeek(value) {
  if (!value) {
    return "";
  }
  const parts = String(value).slice(0, 10).split("-");
  if (parts.length !== 3) {
    return String(value);
  }
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  if (isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatMoney(value) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || isNaN(amount)) {
    return "–";
  }
  return "$" + Math.round(amount).toLocaleString("en-US");
}

function formatNumber(value) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || isNaN(amount)) {
    return "–";
  }
  return amount.toLocaleString("en-US");
}

function formatPercent(value) {
  const amount = Number(value);
  if (value === null || value === undefined || value === "" || isNaN(amount)) {
    return "–";
  }
  return Math.round(amount) + "%";
}

export default function HomePage() {
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  async function loadSummary() {
    try {
      const response = await fetch("/api/summary");
      if (!response.ok) {
        throw new Error("Could not load summary");
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      setSummary(null);
    }
  }

  async function loadEntries() {
    try {
      const response = await fetch("/api/entries");
      if (!response.ok) {
        throw new Error("Could not load entries");
      }
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      setEntries([]);
    }
  }

  useEffect(() => {
    loadSummary();
    loadEntries();
  }, []);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        throw new Error("Request failed with status " + response.status);
      }
      setForm(emptyForm);
      loadSummary();
      loadEntries();
    } catch (error) {
      console.error("Could not save the entry:", error);
      setFormError(SUBMIT_ERROR);
    }
  }

  const byLocation = summary && summary.by_location ? summary.by_location : [];

  return (
    <main className="page">
      <header className="page-header">
        <h1>The Bean Counter</h1>
        <p className="subtitle">Common Grounds Coffee — weekly numbers, one place</p>
      </header>

      <section className="tiles">
        <div className="tile">
          <span className="tile-label">Latest week&rsquo;s drinks</span>
          <span className="tile-value">
            {summary ? formatNumber(summary.drinks_latest_week) : "–"}
          </span>
        </div>
        <div className="tile">
          <span className="tile-label">Latest week&rsquo;s revenue</span>
          <span className="tile-value">
            {summary ? formatMoney(summary.revenue_latest_week) : "–"}
          </span>
        </div>
        <div className="tile">
          <span className="tile-label">Monthly goal progress</span>
          <span className="tile-value">
            {summary ? formatPercent(summary.goal_progress_pct) : "–"}
          </span>
        </div>
      </section>

      <section className="card">
        <h2>Latest week by caf&eacute;</h2>
        {byLocation.length === 0 ? (
          <p className="empty-state">No caf&eacute; data yet</p>
        ) : (
          <div className="cafe-cards">
            {byLocation.map((cafe) => (
              <div className="cafe-card" key={cafe.location}>
                <span className="cafe-name">{cafe.location}</span>
                <span className="cafe-revenue">{formatMoney(cafe.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Log a week</h2>
        <form className="entry-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="week_of">Week of</label>
            <input
              id="week_of"
              name="week_of"
              type="date"
              value={form.week_of}
              onChange={handleFieldChange}
            />
          </div>

          <div className="field">
            <label htmlFor="location">Caf&eacute;</label>
            <select
              id="location"
              name="location"
              value={form.location}
              onChange={handleFieldChange}
            >
              <option value="">Select a caf&eacute;</option>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="drinks_sold">Drinks sold</label>
            <input
              id="drinks_sold"
              name="drinks_sold"
              type="number"
              min="0"
              value={form.drinks_sold}
              onChange={handleFieldChange}
            />
          </div>

          <div className="field">
            <label htmlFor="revenue">Revenue ($)</label>
            <input
              id="revenue"
              name="revenue"
              type="number"
              min="0"
              value={form.revenue}
              onChange={handleFieldChange}
            />
          </div>

          <div className="field">
            <label htmlFor="loyalty_signups">Loyalty signups</label>
            <input
              id="loyalty_signups"
              name="loyalty_signups"
              type="number"
              min="0"
              value={form.loyalty_signups}
              onChange={handleFieldChange}
            />
          </div>

          <div className="field">
            <label htmlFor="bags_sold">Bags sold</label>
            <input
              id="bags_sold"
              name="bags_sold"
              type="number"
              min="0"
              value={form.bags_sold}
              onChange={handleFieldChange}
            />
          </div>

          <div className="field field-wide">
            <label htmlFor="notes">Notes (optional)</label>
            <input
              id="notes"
              name="notes"
              type="text"
              value={form.notes}
              onChange={handleFieldChange}
            />
          </div>

          <div className="form-actions">
            <button type="submit">Save entry</button>
            {formError ? <p className="form-error">{formError}</p> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="table-header">
          <h2>Entries</h2>
          <a className="export-link" href="/api/export">
            Export CSV
          </a>
        </div>

        {entries.length === 0 ? (
          <p className="empty-state">No entries to show — is the back end running?</p>
        ) : (
          <table className="entries-table">
            <thead>
              <tr>
                <th>Week</th>
                <th>Caf&eacute;</th>
                <th>Drinks</th>
                <th>Revenue</th>
                <th>Signups</th>
                <th>Bags</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>{formatWeek(entry.week_of)}</td>
                  <td>{entry.location}</td>
                  <td className="numeric">{formatNumber(entry.drinks_sold)}</td>
                  <td className="numeric">{formatMoney(entry.revenue)}</td>
                  <td className="numeric">{formatNumber(entry.loyalty_signups)}</td>
                  <td className="numeric">{formatNumber(entry.bags_sold)}</td>
                  <td>{entry.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
