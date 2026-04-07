import { useEffect, useMemo, useState } from "react";
import useGetUsers from "@/hooks/useGetUsers";
import "./EventLanding.css";

const REFRESH_SECONDS = 30;

export default function EventLanding() {
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useGetUsers();
  const [secondsLeft, setSecondsLeft] = useState(REFRESH_SECONDS);
  const [nextRefreshAt, setNextRefreshAt] = useState(() => Date.now() + REFRESH_SECONDS * 1000);

  useEffect(() => {
    setNextRefreshAt(Date.now() + REFRESH_SECONDS * 1000);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const remainingMs = nextRefreshAt - Date.now();
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(remainingSeconds);

      if (remainingMs <= 0) {
        void refetch();
        setNextRefreshAt(Date.now() + REFRESH_SECONDS * 1000);
      }
    }, 250);

    return () => window.clearInterval(timer);
  }, [nextRefreshAt, refetch]);

  const userCount = useMemo(() => {
    return data?.data?.userList?.length ?? 0;
  }, [data]);

  const lastUpdatedLabel = useMemo(() => {
    if (!dataUpdatedAt) return "Waiting for first successful refresh...";
    return new Date(dataUpdatedAt).toLocaleTimeString();
  }, [dataUpdatedAt]);

  return (
    <main className="event-landing">
      <div className="event-noise" aria-hidden="true" />
      <div className="event-blur event-blur-one" aria-hidden="true" />
      <div className="event-blur event-blur-two" aria-hidden="true" />
      <div className="event-branch-lines" aria-hidden="true" />

      <section className="event-shell">
        <div className="event-hero">
          <div className="event-hero-main">
            <img className="event-logo" src="/logo.png" alt="ezwa & sanad" />
            <p className="event-brand">ezwa &amp; sanad</p>
            <p className="event-kicker">Live Family Tree Pulse</p>
            <h1 className="event-title">Our Family Tree Is Growing In Real Time</h1>
            <p className="event-subtitle">
              Every new member strengthens the branches of our community. This screen tracks the active family network live during
              the event.
            </p>
            <div className="event-chip-row">
              <span className="event-chip">Generations Connected</span>
              <span className="event-chip">Stories Preserved</span>
              <span className="event-chip">Community Expanding</span>
            </div>
          </div>

          <aside className="event-story-card">
            <p className="story-label">Family Network Snapshot</p>
            <p className="story-text">Each profile represents a household, a history, and a connection that keeps our family tree alive.</p>
            <div className="story-divider" />
            <p className="story-footnote">Live updates make this a real-time view of growth across relatives, branches, and generations.</p>
          </aside>
        </div>

        <div className="event-grid">
          <article className="metric-card">
            <p className="metric-label">Family Members On Platform</p>
            <p className={`metric-value ${isFetching ? "metric-value-refreshing" : ""}`}>
              {isLoading ? "..." : userCount.toLocaleString()}
            </p>
            <p className="metric-meta">
              {isError ? "Could not fetch users. Retrying automatically." : `Last updated: ${lastUpdatedLabel}`}
            </p>
          </article>

          <article className="status-card">
            <div>
              <p className="status-label">Live Sync</p>
              <p className="status-value">Every {REFRESH_SECONDS}s</p>
              <p className="status-caption">No interaction needed. New branches appear automatically.</p>
            </div>
            <div className="countdown-ring" role="status" aria-live="polite">
              <span>{secondsLeft}s</span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
