"use client";
import { BookOpen, Check, ChevronRight, Flag, Target } from "lucide-react";
import { milestones, weeks } from "../lib/curriculum";
import type { RoadmapProgress } from "../lib/quest";

export default function LearningRoadmap({
  progress,
  onToggle,
  onNotes,
  status,
}: {
  progress: RoadmapProgress;
  onToggle: (id: string) => void;
  onNotes: (key: string, value: string) => void;
  status: string;
}) {
  const completed = new Set(progress.completedTaskIds);
  const total = weeks.reduce((n, w) => n + w.days.length, 0);
  const done = weeks
    .flatMap((w) => w.days)
    .filter((d) => completed.has(d.id)).length;
  const percent = Math.round((done / total) * 100);
  return (
    <div className="learning-roadmap">
      <section className="card roadmap-overview">
        <span className="section-kicker">24 WEEKS · YOUR OWN PACE</span>
        <div className="card-heading">
          <h2>Your path to engineering confidence</h2>
          <span className="roadmap-overall">{percent}% complete</span>
        </div>
        <p>
          Start with two weeks of fundamentals, then build problem-solving
          skills one pattern at a time. Repeat a week when needed; the schedule
          is a plan, not a deadline.
        </p>
        <progress
          aria-label="Overall roadmap progress"
          max={total}
          value={done}
        />
        <div className="roadmap-stats">
          <span>
            <Flag size={15} />
            {done} completed · {total - done} unfinished daily plans
          </span>
          <span>150 new problems planned from Day 15</span>
        </div>
        <details className="study-guide">
          <summary>
            <BookOpen size={16} /> How to use your 4 hours{" "}
            <ChevronRight size={15} />
          </summary>
          <p>
            Daily default: 45 minutes learning the concept, 120 minutes
            implementing and solving, 45 minutes reviewing or porting a solution
            to C++, and 30 minutes testing, notes, and a commit. Use Python as
            your primary problem-solving language, with selected C++ ports.
          </p>
          <p>
            Each checkbox covers the entire day’s plan, including its
            deliverable. Day 7 is a review/checkpoint day; later weeks may
            include short new problems. Stop at the time budget and carry
            unfinished work forward. Weekly problem targets are suggested counts
            of unique Easy/Medium problems, not automatic solved credits. A
            repeat attempt or C++ port never counts as a new problem.
          </p>
          <p>
            Useful references:{" "}
            <a
              href="https://docs.python.org/3/tutorial/"
              target="_blank"
              rel="noreferrer"
            >
              Python tutorial
            </a>{" "}
            ·{" "}
            <a
              href="https://isocpp.org/get-started"
              target="_blank"
              rel="noreferrer"
            >
              Standard C++ getting started
            </a>{" "}
            ·{" "}
            <a
              href="https://leetcode.com/studyplan/top-interview-150/"
              target="_blank"
              rel="noreferrer"
            >
              LeetCode interview topic reference
            </a>
            . Select Easy/Medium problems appropriate to your level; this custom
            roadmap is not the official LeetCode list.
          </p>
        </details>
      </section>
      <div className="roadmap-list">
        {milestones.map((m) => {
          const group = weeks.filter((w) => w.milestone === m.id),
            tasks = group.flatMap((w) => w.days),
            count = tasks.filter((d) => completed.has(d.id)).length,
            pct = Math.round((count / tasks.length) * 100),
            target = group.reduce((n, w) => n + w.newProblems, 0);
          return (
            <details
              className="card roadmap-milestone"
              key={m.id}
              open={m.id === 0 ? true : undefined}
            >
              <summary>
                <span className="milestone-number">
                  {String(m.id).padStart(2, "0")}
                </span>
                <div className="milestone-label">
                  <h3>{m.title}</h3>
                  <span>{m.range}</span>
                </div>
                <div className="milestone-summary">
                  <strong>{pct}%</strong>
                  <span>
                    {count}/{tasks.length} done
                  </span>
                </div>
                <ChevronRight className="expand-chevron" size={19} />
              </summary>
              <div className="milestone-content">
                <div className="milestone-objectives">
                  <h4>
                    <Target size={16} /> Learning objectives
                  </h4>
                  <ul>
                    {m.objectives.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                  <div className="roadmap-stats">
                    <span>
                      {count} completed · {tasks.length - count} unfinished
                    </span>
                    <span>
                      {target
                        ? `${target} new problems planned`
                        : "Foundation exercises · 0 LeetCode credits"}
                    </span>
                  </div>
                  <progress
                    aria-label={`${m.title} progress`}
                    max={tasks.length}
                    value={count}
                  />
                </div>
                {group.map((w) => {
                  const finished = w.days.filter((d) =>
                    completed.has(d.id),
                  ).length;
                  return (
                    <details className="roadmap-week" key={w.number}>
                      <summary>
                        <span className="week-tag">
                          WEEK {String(w.number).padStart(2, "0")}
                        </span>
                        <div className="week-label">
                          <h4>{w.title}</h4>
                          <span>
                            Days {(w.number - 1) * 7 + 1}–{w.number * 7} ·{" "}
                            {w.newProblems
                              ? `${w.newProblems} new problems planned`
                              : "Programming exercises only"}
                          </span>
                        </div>
                        <span className="week-count">
                          {Math.round((finished / 7) * 100)}% · {finished}/7
                        </span>
                        <ChevronRight className="expand-chevron" size={16} />
                      </summary>
                      <div className="week-content">
                        <h5>This week you’ll learn to</h5>
                        <ul>
                          {w.objectives.map((o) => (
                            <li key={o}>{o}</li>
                          ))}
                        </ul>
                        <div className="daily-plan-heading">
                          <h5>Daily learning tasks</h5>
                          <span>
                            {finished} completed · {7 - finished} unfinished
                          </span>
                        </div>
                        <div className="daily-plans">
                          {w.days.map((d, i) => (
                            <label
                              className={`daily-plan ${completed.has(d.id) ? "plan-complete" : ""}`}
                              key={d.id}
                            >
                              <input
                                type="checkbox"
                                checked={completed.has(d.id)}
                                onChange={() => onToggle(d.id)}
                                aria-label={`Complete Day ${d.day}: ${w.title}`}
                              />
                              <span className="plan-day">
                                DAY {d.day}
                                <small>
                                  {i === 6 ? "CHECKPOINT" : "4-HOUR PLAN"}
                                </small>
                              </span>
                              <span className="plan-task">{d.task}</span>
                              <span className="plan-state">
                                {completed.has(d.id) ? (
                                  <>
                                    <Check size={12} /> Done
                                  </>
                                ) : (
                                  "To do"
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                        <label className="roadmap-note">
                          Week {w.number} reflection
                          <textarea
                            aria-label={`Week ${w.number} reflection`}
                            rows={3}
                            maxLength={10000}
                            value={progress.notes[`week-${w.number}`] || ""}
                            placeholder="What clicked? What should I revisit next week?"
                            onChange={(e) =>
                              onNotes(`week-${w.number}`, e.target.value)
                            }
                          />
                        </label>
                      </div>
                    </details>
                  );
                })}
                <label className="roadmap-note milestone-note">
                  Milestone {m.id} personal notes
                  <textarea
                    aria-label={`Milestone ${m.id} personal notes`}
                    rows={3}
                    maxLength={10000}
                    value={progress.notes[`milestone-${m.id}`] || ""}
                    placeholder="Capture your understanding, weak spots, and next steps…"
                    onChange={(e) =>
                      onNotes(`milestone-${m.id}`, e.target.value)
                    }
                  />
                </label>
                <p className="roadmap-save-status" role="status">
                  {status}
                </p>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
