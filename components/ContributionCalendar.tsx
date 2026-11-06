"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Flame, Info } from "lucide-react";
import { Activity, todayKey } from "../lib/quest";
export default function ContributionCalendar({
  activity,
}: {
  activity: Activity[];
}) {
  const [selected, setSelected] = useState("");
  const scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = scroll.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      element.scrollLeft = element.scrollWidth;
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const { weeks, counts, total, activeDays, months } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const event of activity)
      counts.set(event.date, (counts.get(event.date) || 0) + 1);
    const end = new Date();
    end.setHours(12, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - 364);
    start.setDate(start.getDate() - start.getDay());
    const weeks: {
      date: string;
      count: number;
      future: boolean;
      label: string;
    }[][] = [];
    const months: { column: number; label: string }[] = [];
    let previousMonth = -1;
    const cursor = new Date(start);
    while (cursor <= end) {
      const week = [];
      for (let day = 0; day < 7; day++) {
        const date = todayKey(cursor);
        if (cursor.getMonth() !== previousMonth && cursor <= end) {
          months.push({
            column: weeks.length + 1,
            label: cursor.toLocaleDateString("en-US", { month: "short" }),
          });
          previousMonth = cursor.getMonth();
        }
        week.push({
          date,
          count: counts.get(date) || 0,
          future: cursor > end,
          label: cursor.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }
    const visible = weeks.flat().filter((d) => !d.future);
    return {
      weeks,
      counts,
      months,
      total: visible.reduce((sum, d) => sum + d.count, 0),
      activeDays: visible.filter((d) => d.count > 0).length,
    };
  }, [activity]);
  const level = (count: number) => Math.min(count, 4);
  return (
    <section className="card contribution-card">
      <div className="card-heading">
        <div>
          <span className="section-kicker">SHOWING UP IS A SUPERPOWER</span>
          <h3>
            <Flame size={20} /> Your learning constellation
          </h3>
        </div>
        <span className="activity-summary">
          <strong>{activeDays}</strong> active{" "}
          {activeDays === 1 ? "day" : "days"}
        </span>
      </div>
      <p>
        <strong>
          {total} contribution{total === 1 ? "" : "s"}
        </strong>{" "}
        in the last year. One little square, one step forward.
      </p>
      <div className="contribution-scroll" ref={scroll}>
        <div className="contribution-chart">
          <div
            className="month-row"
            style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
          >
            {months.map((month, i) => (
              <span
                key={`${month.column}-${i}`}
                style={{ gridColumn: month.column }}
              >
                {month.label}
              </span>
            ))}
          </div>
          <div className="contribution-body">
            <div className="weekday-labels">
              <span />
              <span>Mon</span>
              <span />
              <span>Wed</span>
              <span />
              <span>Fri</span>
              <span />
            </div>
            <div
              className="heatmap"
              style={{ gridTemplateColumns: `repeat(${weeks.length}, 1fr)` }}
            >
              {weeks.map((week) =>
                week.map((day) => (
                  <button
                    key={day.date}
                    disabled={day.future}
                    className={`heat-cell heat-${level(day.count)} ${selected === day.date ? "selected" : ""}`}
                    title={`${day.count} contributions on ${day.label}`}
                    aria-label={`${day.count} contributions on ${day.label}`}
                    onClick={() => setSelected(day.date)}
                  />
                )),
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="contribution-footer">
        <span>
          <Info size={13} />
          {selected
            ? `${counts.get(selected) || 0} contributions on ${selected}`
            : "Complete a task, save a study session, or create an entry."}
        </span>
        <div className="heat-legend">
          Less{" "}
          {[0, 1, 2, 3, 4].map((n) => (
            <span key={n} className={`heat-cell heat-${n}`} />
          ))}{" "}
          More
        </div>
      </div>
    </section>
  );
}
