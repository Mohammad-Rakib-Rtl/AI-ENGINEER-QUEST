"use client";
import { useEffect, useState } from "react";
import ContributionCalendar from "../components/ContributionCalendar";
import CloudAccount from "../components/CloudAccount";
import { Data, emptyRoadmap, isQuestData, todayKey } from "../lib/quest";
import LearningRoadmap from "../components/LearningRoadmap";
import { useQuestStore } from "../lib/useQuestStore";
import {
  Rocket,
  LayoutDashboard,
  Orbit,
  Code2,
  Map,
  NotebookPen,
  Bug,
  ChartNoAxesCombined,
  Cpu,
  Telescope,
  BriefcaseBusiness,
  Settings,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Flame,
  Clock3,
  Check,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  CircleHelp,
  MoreHorizontal,
  X,
  Download,
  Star,
  Satellite,
  Target,
} from "lucide-react";
const links = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Daily Quest", icon: Orbit },
  { name: "Coding Problems", icon: Code2 },
  { name: "Learning Roadmap", icon: Map },
  { name: "Notes", icon: NotebookPen },
  { name: "Mistake Book", icon: Bug },
  { name: "Weekly Reports", icon: ChartNoAxesCombined },
  { name: "Systems Engineering", icon: Cpu },
  { name: "Projects & Thesis", icon: Telescope },
  { name: "Career Tracker", icon: BriefcaseBusiness },
];
const initial: Data = {
  tasks: [
    {
      id: "python",
      title: "Get comfortable with Python basics",
      subject: "Python",
      minutes: 60,
      done: false,
    },
    {
      id: "cpp",
      title: "Practice C++ input and output",
      subject: "C++",
      minutes: 60,
      done: false,
    },
    {
      id: "practice",
      title: "Practice loops and conditionals",
      subject: "Foundations",
      minutes: 90,
      done: false,
    },
    {
      id: "reflect",
      title: "Reflect and write a learning note",
      subject: "Reflection",
      minutes: 30,
      done: false,
    },
  ],
  entries: [],
  seconds: 0,
  started: null,
  hours: 0,
  target: 4,
  activity: [],
  roadmap: emptyRoadmap(),
};
export default function Home() {
  const {
    data,
    setData,
    ready,
    user,
    status,
    error,
    conflict,
    retrySync,
    reloadCloud,
  } = useQuestStore(initial);
  const [page, setPage] = useState("Overview"),
    [now, setNow] = useState(0),
    [modal, setModal] = useState(false),
    [title, setTitle] = useState(""),
    [body, setBody] = useState(""),
    [subject, setSubject] = useState("Python"),
    [notice, setNotice] = useState(""),
    [menu, setMenu] = useState(false);
  useEffect(() => {
    setNow(Date.now());
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const completed = data.tasks.filter((t) => t.done).length,
    percent = Math.round((completed / data.tasks.length) * 100) || 0,
    elapsed =
      data.seconds +
      (data.started ? Math.max(0, Math.floor((now - data.started) / 1000)) : 0);
  const clock = `${String(Math.floor(elapsed / 3600)).padStart(2, "0")}:${String(Math.floor(elapsed / 60) % 60).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;
  const navigate = (name: string) => {
    setPage(name);
    setMenu(false);
  };
  const toggle = (id: string) =>
    setData((d) => {
      const task = d.tasks.find((t) => t.id === id);
      const eventId = `task-${id}-${todayKey()}`;
      return {
        ...d,
        tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
        activity:
          !task?.done && !d.activity.some((a) => a.id === eventId)
            ? [...d.activity, { id: eventId, date: todayKey(), kind: "task" }]
            : d.activity,
      };
    });
  const save = () => {
    if (!title.trim()) return;
    if (page === "Daily Quest" || page === "Overview")
      setData((d) => ({
        ...d,
        tasks: [
          ...d.tasks,
          {
            id: crypto.randomUUID(),
            title: title.trim(),
            subject,
            minutes: 30,
            done: false,
          },
        ],
      }));
    else {
      const id = crypto.randomUUID();
      setData((d) => ({
        ...d,
        entries: [
          ...d.entries,
          { id, section: page, title: title.trim(), body },
        ],
        activity: [
          ...d.activity,
          { id: `entry-${id}`, date: todayKey(), kind: "entry" },
        ],
      }));
    }
    setModal(false);
    setTitle("");
    setBody("");
  };
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "rakib-quest-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };
  const taskList = (
    <div className="tasks">
      {data.tasks.map((t) => (
        <div className={`task ${t.done ? "done" : ""}`} key={t.id}>
          <button
            className="checkbox"
            aria-label={`Mark ${t.title} ${t.done ? "incomplete" : "complete"}`}
            onClick={() => toggle(t.id)}
          >
            {t.done && <Check size={13} />}
          </button>
          <div>
            <span className="task-title">{t.title}</span>
            <div className="task-meta">
              <span>{t.subject}</span>
              <span>
                <Clock3 size={11} /> {t.minutes} min
              </span>
            </div>
          </div>
          <button
            className="remove"
            aria-label={`Remove ${t.title}`}
            onClick={() =>
              setData((d) => ({
                ...d,
                tasks: d.tasks.filter((x) => x.id !== t.id),
              }))
            }
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
  const timer = (
    <section className="card focus">
      <div className="card-heading">
        <h3>
          <Orbit size={17} /> Time to focus
        </h3>
        <span className="tiny">ONE STEP AT A TIME</span>
      </div>
      <p>A little deep work goes a long way.</p>
      <select
        aria-label="Study subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      >
        {[
          "Python",
          "C++",
          "LeetCode",
          "Algorithms",
          "Linux",
          "LenKV Research",
          "System Design",
        ].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <div className="timer">{clock}</div>
      <div className="timer-controls">
        <button
          className="primary"
          onClick={() =>
            setData((d) => ({
              ...d,
              seconds: elapsed,
              started: d.started ? null : Date.now(),
            }))
          }
        >
          {data.started ? <Pause size={15} /> : <Play size={15} />}{" "}
          {data.started
            ? "Pause session"
            : elapsed
              ? "Resume session"
              : "Start session"}
        </button>
        <button
          className="icon-button"
          aria-label="Reset timer"
          onClick={() => setData((d) => ({ ...d, seconds: 0, started: null }))}
        >
          <RotateCcw size={16} />
        </button>
      </div>
      {elapsed > 0 && (
        <button
          className="text-button"
          onClick={() => {
            setData((d) => ({
              ...d,
              hours: d.hours + elapsed / 3600,
              seconds: 0,
              started: null,
              activity: [
                ...d.activity,
                {
                  id: crypto.randomUUID(),
                  date: todayKey(),
                  kind: "session",
                  minutes: elapsed / 60,
                },
              ],
            }));
            setNotice("Session recorded. Check the save status above.");
          }}
        >
          Save session
        </button>
      )}
      <div className="focus-footer">
        <span className="status-dot" /> Your future self will thank you.
      </div>
    </section>
  );
  if (!ready)
    return (
      <div className="loading-screen">
        <Rocket size={38} />
        <h2>Preparing your mission control</h2>
        <p>{status}</p>
      </div>
    );
  return (
    <div className="app">
      <aside className={menu ? "sidebar open" : "sidebar"}>
        <a className="brand" href="#" onClick={() => navigate("Overview")}>
          <span className="brand-icon">
            <Rocket size={22} />
          </span>
          <span>
            AI ENGINEER
            <span className="brand-sub">
              QUEST <span> / </span> MY LEARNING JOURNEY
            </span>
          </span>
        </a>
        <div className="workspace">
          <span className="avatar">R</span>
          <div>
            <strong>Rakib’s workspace</strong>
            <small>Personal learning space</small>
          </div>
          <span className="workspace-dot" />
        </div>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {links.map(({ name, icon: Icon }, i) => (
            <button
              key={name}
              className={page === name ? "nav-item active" : "nav-item"}
              onClick={() => navigate(name)}
            >
              <Icon size={18} />
              {name}
              {i === 1 && (
                <span className="nav-count">
                  {data.tasks.length - completed}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="journey-card">
            <span className="little-orbit">
              <Rocket size={20} />
            </span>
            <strong>Small steps. Big possibilities.</strong>
            <p>
              Your next chapter starts with
              <br />
              what you learn today.
            </p>
            <div className="journey-line">
              <span />
            </div>
            <small>YOUR ENGINEERING JOURNEY</small>
          </div>
          <button
            className="nav-item"
            onClick={() => navigate("Settings & Backup")}
          >
            <Settings size={18} />
            Settings & Backup
          </button>
          <button
            className="profile"
            onClick={() => navigate("Settings & Backup")}
          >
            <span className="avatar profile-avatar">R</span>
            <span>
              <strong>Rakibuzzaman Md.</strong>
              <small>Aspiring AI engineer</small>
            </span>
            <MoreHorizontal size={18} />
          </button>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div>
            <button
              className="mobile-menu icon-button"
              aria-label="Open navigation"
              onClick={() => setMenu(!menu)}
            >
              <LayoutDashboard size={18} />
            </button>
            <span className="breadcrumb">
              My workspace <ChevronRight size={13} /> <strong>{page}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className={`local-label ${error ? "status-warning" : ""}`}>
              <span className="status-dot" /> {status}
            </span>
            <button
              className="icon-button"
              aria-label="Help and backup"
              onClick={() => navigate("Settings & Backup")}
            >
              <CircleHelp size={18} />
            </button>
            <span className="avatar small-avatar">R</span>
          </div>
        </header>
        <main>
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span /> YOUR PERSONAL MISSION CONTROL
              </div>
              <h1>
                {page === "Overview" ? "Ready for your next big leap?" : page}
              </h1>
              <p>
                {page === "Overview"
                  ? "Welcome back, Rakib. Let’s build the engineer you want to become."
                  : "Keep it simple. Stay curious. Make a little progress."}
              </p>
            </div>
            <button
              className="account-link"
              onClick={() => navigate("Settings & Backup")}
            >
              {user ? "My cloud account" : "Connect cloud account"}{" "}
              <ArrowUpRight size={14} />
            </button>
            <div className="date-label">
              {new Date(now || Date.now()).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          {error && page !== "Settings & Backup" && (
            <div className="notice sync-notice">
              <span>
                Cloud changes need attention. Your local draft is preserved.
              </span>
              <button onClick={() => navigate("Settings & Backup")}>
                Review saving <ArrowRight size={14} />
              </button>
            </div>
          )}
          {notice && (
            <div className="notice">
              {notice}
              <button aria-label="Dismiss" onClick={() => setNotice("")}>
                <X size={15} />
              </button>
            </div>
          )}
          {(page === "Overview" || page === "Daily Quest") && (
            <>
              {page === "Overview" && (
                <>
                  <section className="mission-banner">
                    <div className="mission-copy">
                      <span className="pill">
                        <span /> YOUR FUTURE STARTS WITH TODAY
                      </span>
                      <h2>
                        Dream big.
                        <br />
                        Build something brilliant.
                      </h2>
                      <p>
                        From your first line of code to AI engineering.
                        <br />
                        Show up, stay curious, and enjoy the journey.
                      </p>
                      <button
                        className="primary"
                        onClick={() => navigate("Daily Quest")}
                      >
                        Let’s start today’s quest <ArrowRight size={16} />
                      </button>
                      <div className="banner-details">
                        <span>
                          <Target size={14} /> Daily goal: {data.target} hours
                        </span>
                        <span className="divider" />
                        <span>Milestone 0 · Foundations</span>
                      </div>
                    </div>
                    <div className="space-art" aria-hidden="true">
                      <div className="orbit orbit-one" />
                      <div className="orbit orbit-two" />
                      <span className="art-star s1">+</span>
                      <span className="art-star s2">✧</span>
                      <span className="art-star s3">+</span>
                      <span className="planet" />
                      <span className="satellite">
                        <Satellite size={28} strokeWidth={1.2} />
                      </span>
                      <span className="space-badge badge-code">
                        <Code2 size={21} />
                      </span>
                      <span className="space-badge badge-star">
                        <Star size={20} />
                      </span>
                      <div className="rocket-disc">
                        <Rocket size={112} strokeWidth={1} />
                      </div>
                      <div className="art-caption">
                        <span /> READY FOR LIFTOFF
                      </div>
                    </div>
                  </section>
                  <div className="metrics">
                    {[
                      {
                        label: "Time spent learning",
                        value: `${data.hours.toFixed(1)}`,
                        unit: "hrs",
                        icon: Clock3,
                        foot: `Your goal: ${data.target} hours a day`,
                        color: "blue",
                      },
                      {
                        label: "Coding entries",
                        value: String(
                          data.entries.filter(
                            (e) => e.section === "Coding Problems",
                          ).length,
                        ),
                        unit: "saved",
                        icon: Code2,
                        foot: "The 150-problem adventure",
                        color: "purple",
                      },
                      {
                        label: "Quests completed",
                        value: String(completed),
                        unit: `/ ${data.tasks.length}`,
                        icon: Check,
                        foot: "Small wins add up",
                        color: "green",
                      },
                      {
                        label: "My learning level",
                        value: String(1 + Math.floor(completed / 10)),
                        unit: "Explorer",
                        icon: Orbit,
                        foot: `${completed * 25} XP · Keep exploring`,
                        color: "orange",
                      },
                    ].map(({ label, value, unit, icon: Icon, foot, color }) => (
                      <section className="card metric" key={label}>
                        <div className="metric-top">
                          <span>{label}</span>
                          <span className={`metric-icon ${color}`}>
                            <Icon size={17} />
                          </span>
                        </div>
                        <div className="metric-value">
                          {value}
                          <small>{unit}</small>
                        </div>
                        <div className="metric-foot">{foot}</div>
                      </section>
                    ))}
                  </div>
                </>
              )}
              {page === "Overview" && (
                <ContributionCalendar activity={data.activity} />
              )}
              <div className="work-grid">
                <section className="card quest-card">
                  <div className="card-heading">
                    <h3>
                      <span className="blue-text">
                        <Rocket size={18} />
                      </span>{" "}
                      Today’s mission <span className="day-pill">DAY 01</span>
                    </h3>
                    <button
                      className="text-button"
                      onClick={() => {
                        setTitle("");
                        setModal(true);
                      }}
                    >
                      <Plus size={14} /> Add task
                    </button>
                  </div>
                  <div className="quest-intro">
                    <div>
                      <h4>Build a strong foundation</h4>
                      <p>Get to know your tools. Take the first step.</p>
                    </div>
                    <div
                      className="progress-ring"
                      style={{
                        background: `conic-gradient(#3678ef ${percent}%, #edf1f6 0)`,
                      }}
                    >
                      <span>{percent}%</span>
                    </div>
                  </div>
                  {taskList}
                  <div className="card-bottom">
                    <span>
                      {completed} of {data.tasks.length} tasks completed
                    </span>
                    <span>
                      You’ve got this <span className="blue-text">✧</span>
                    </span>
                  </div>
                </section>
                {timer}
              </div>
              <div className="lower-grid">
                <section className="card roadmap">
                  <div className="card-heading">
                    <h3>
                      <Map size={17} /> Your flight path
                    </h3>
                    <button
                      className="text-button"
                      onClick={() => navigate("Learning Roadmap")}
                    >
                      View roadmap <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <p>Every expert was once a beginner.</p>
                  <div className="flight-path">
                    {["Foundations", "Problem solving", "Systems & AI"].map(
                      (s, i) => (
                        <div
                          className={
                            i === 0 ? "flight-stop current" : "flight-stop"
                          }
                          key={s}
                        >
                          <span>
                            {i === 0 ? (
                              <Rocket size={17} />
                            ) : i === 1 ? (
                              <Code2 size={17} />
                            ) : (
                              <Cpu size={17} />
                            )}
                          </span>
                          <strong>{s}</strong>
                          <small>
                            {["Days 1–14", "Weeks 3–16", "Weeks 17–24"][i]}
                          </small>
                          {i === 0 && <em>YOU ARE HERE</em>}
                        </div>
                      ),
                    )}
                  </div>
                </section>
                <section className="card note-card">
                  <div className="card-heading">
                    <h3>
                      <NotebookPen size={17} /> A thought for the journey
                    </h3>
                    <Star size={16} className="muted" />
                  </div>
                  <blockquote>
                    “You don’t have to be great to start.
                    <br />
                    But you have to start to be great.”
                  </blockquote>
                  <span className="quote-credit">
                    A LITTLE REMINDER FOR TODAY
                  </span>
                </section>
              </div>
            </>
          )}
          {page === "Learning Roadmap" && (
            <LearningRoadmap
              progress={data.roadmap}
              status={status}
              onToggle={(id) =>
                setData((d) => {
                  const done = d.roadmap.completedTaskIds.includes(id);
                  const eventId = `roadmap-${id}-${todayKey()}`;
                  return {
                    ...d,
                    roadmap: {
                      ...d.roadmap,
                      completedTaskIds: done
                        ? d.roadmap.completedTaskIds.filter((x) => x !== id)
                        : [...d.roadmap.completedTaskIds, id],
                    },
                    activity:
                      !done && !d.activity.some((a) => a.id === eventId)
                        ? [
                            ...d.activity,
                            { id: eventId, date: todayKey(), kind: "task" },
                          ]
                        : d.activity,
                  };
                })
              }
              onNotes={(key, value) =>
                setData((d) => ({
                  ...d,
                  roadmap: {
                    ...d.roadmap,
                    notes: { ...d.roadmap.notes, [key]: value },
                  },
                }))
              }
            />
          )}
          {page === "Weekly Reports" && (
            <section className="card empty-section">
              <ChartNoAxesCombined size={32} />
              <h2>Your progress, at a glance</h2>
              <p>
                {data.hours.toFixed(1)} study hours saved · {completed} tasks
                completed ·{" "}
                {
                  data.entries.filter((e) => e.section === "Coding Problems")
                    .length
                }{" "}
                coding entries
              </p>
              <p>
                Save study sessions and finish tasks to build your learning
                history.
              </p>
            </section>
          )}
          {page === "Settings & Backup" && (
            <section className="card settings-card">
              <CloudAccount
                user={user}
                status={status}
                error={error}
                conflict={conflict}
                retrySync={retrySync}
                reloadCloud={reloadCloud}
              />
              <h3>Make this space yours</h3>
              <label>
                Daily learning target (hours)
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={data.target}
                  onChange={(e) =>
                    setData((d) => ({
                      ...d,
                      target: Math.max(1, Math.min(24, Number(e.target.value))),
                    }))
                  }
                />
              </label>
              <h3>Your data & backup</h3>
              <p>
                Signed-in changes save to your private Supabase workspace after
                confirmation. A local recovery draft is kept in this browser.
                When signed out, changes stay on this device. Export a backup
                regularly.
              </p>
              <button className="primary" onClick={exportData}>
                <Download size={16} /> Export JSON backup
              </button>
              <h3>Restore a backup</h3>
              <p>
                Importing replaces this device’s learning data after
                confirmation.
              </p>
              <input
                type="file"
                accept="application/json"
                aria-label="Import backup"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const parsed = JSON.parse(await file.text());
                    if (!isQuestData(parsed)) throw Error();
                    if (
                      confirm("Replace your current data with this backup?")
                    ) {
                      setData({
                        ...parsed,
                        activity: parsed.activity || [],
                        roadmap: parsed.roadmap || emptyRoadmap(),
                      });
                      setNotice(
                        "Backup restored. Check the save status for cloud synchronization.",
                      );
                    }
                  } catch {
                    setNotice(
                      "This file is not a valid Quest backup. Your data was not changed.",
                    );
                  }
                  e.target.value = "";
                }}
              />
            </section>
          )}
          {![
            "Overview",
            "Daily Quest",
            "Learning Roadmap",
            "Weekly Reports",
            "Settings & Backup",
          ].includes(page) && (
            <section className="card library">
              <div className="card-heading">
                <h3>
                  {page === "Projects & Thesis"
                    ? "Build, experiment, discover"
                    : `Your ${page.toLowerCase()}`}
                </h3>
                <button
                  className="primary"
                  onClick={() => {
                    setTitle("");
                    setBody("");
                    setModal(true);
                  }}
                >
                  <Plus size={15} /> Add {page === "Notes" ? "note" : "entry"}
                </button>
              </div>
              {data.entries.filter((e) => e.section === page).length === 0 ? (
                <div className="empty-section">
                  <Telescope size={38} strokeWidth={1.2} />
                  <h2>A little space for your next big idea.</h2>
                  <p>
                    {page === "Coding Problems"
                      ? "Add a unique problem and record your understanding. Start the official 150-problem journey after your 14 foundation days."
                      : "Keep your learning, reflections, and next steps together."}
                  </p>
                  <button
                    className="text-button"
                    onClick={() => setModal(true)}
                  >
                    Create your first entry <ArrowRight size={15} />
                  </button>
                </div>
              ) : (
                data.entries
                  .filter((e) => e.section === page)
                  .map((e) => (
                    <article className="entry" key={e.id}>
                      <div>
                        <h3>{e.title}</h3>
                        <p>{e.body}</p>
                      </div>
                      <button
                        className="icon-button"
                        aria-label={`Delete ${e.title}`}
                        onClick={() => {
                          if (confirm("Delete this entry?"))
                            setData((d) => ({
                              ...d,
                              entries: d.entries.filter((x) => x.id !== e.id),
                            }));
                        }}
                      >
                        <X size={16} />
                      </button>
                    </article>
                  ))
              )}
            </section>
          )}
          <footer>
            <span>
              <Rocket size={13} /> Built for your next chapter.
            </span>
            <span>
              A little progress, every day.{" "}
              <span className="footer-star">✧</span>
            </span>
          </footer>
        </main>
      </div>
      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(false)}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="card-heading">
              <h3>
                {["Overview", "Daily Quest"].includes(page)
                  ? "Add a mission"
                  : `Add to ${page}`}
              </h3>
              <button
                type="button"
                className="icon-button"
                aria-label="Close"
                onClick={() => setModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <label>
              Title
              <input
                autoFocus
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What’s your next step?"
              />
            </label>
            {!["Overview", "Daily Quest"].includes(page) && (
              <label>
                Notes & understanding
                <textarea
                  rows={7}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Capture what you learned…"
                />
              </label>
            )}
            <button className="primary" type="submit">
              Save{" "}
              {["Overview", "Daily Quest"].includes(page) ? "task" : "entry"}{" "}
              <ArrowRight size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
