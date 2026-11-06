export type Task = {
  id: string;
  title: string;
  subject: string;
  minutes: number;
  done: boolean;
};
export type Entry = {
  id: string;
  section: string;
  title: string;
  body: string;
};
export type Activity = {
  id: string;
  date: string;
  kind: "task" | "session" | "entry";
  minutes?: number;
};
export type RoadmapProgress = {
  completedTaskIds: string[];
  notes: Record<string, string>;
};
export const emptyRoadmap = (): RoadmapProgress => ({
  completedTaskIds: [],
  notes: {},
});
export type Data = {
  tasks: Task[];
  entries: Entry[];
  seconds: number;
  started: number | null;
  hours: number;
  target: number;
  activity: Activity[];
  roadmap: RoadmapProgress;
};
export const todayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function isQuestData(value: unknown): value is Data {
  if (!value || typeof value !== "object") return false;
  const d = value as Data;
  return (
    Array.isArray(d.tasks) &&
    d.tasks.every(
      (t) =>
        typeof t.id === "string" &&
        typeof t.title === "string" &&
        typeof t.subject === "string" &&
        typeof t.done === "boolean" &&
        Number.isFinite(t.minutes) &&
        t.minutes >= 0,
    ) &&
    Array.isArray(d.entries) &&
    d.entries.every(
      (e) =>
        typeof e.id === "string" &&
        typeof e.title === "string" &&
        typeof e.body === "string" &&
        typeof e.section === "string",
    ) &&
    Number.isFinite(d.seconds) &&
    d.seconds >= 0 &&
    Number.isFinite(d.hours) &&
    d.hours >= 0 &&
    Number.isFinite(d.target) &&
    d.target >= 1 &&
    d.target <= 24 &&
    (d.started === null || (Number.isFinite(d.started) && d.started >= 0)) &&
    (d.roadmap === undefined ||
      (d.roadmap !== null &&
        typeof d.roadmap === "object" &&
        Array.isArray(d.roadmap.completedTaskIds) &&
        d.roadmap.completedTaskIds.every(
          (id) =>
            typeof id === "string" &&
            /^w(0[1-9]|1[0-9]|2[0-4])-d[1-7]$/.test(id),
        ) &&
        new Set(d.roadmap.completedTaskIds).size ===
          d.roadmap.completedTaskIds.length &&
        d.roadmap.notes !== null &&
        typeof d.roadmap.notes === "object" &&
        !Array.isArray(d.roadmap.notes) &&
        Object.entries(d.roadmap.notes).every(
          ([key, note]) =>
            /^(milestone-[0-9]|week-([1-9]|1[0-9]|2[0-4]))$/.test(key) &&
            typeof note === "string" &&
            note.length <= 10000,
        ))) &&
    (d.activity === undefined ||
      (Array.isArray(d.activity) &&
        d.activity.every(
          (a) =>
            typeof a.id === "string" &&
            typeof a.date === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
            ["task", "session", "entry"].includes(a.kind) &&
            (a.minutes === undefined ||
              (Number.isFinite(a.minutes) && a.minutes >= 0)),
        )))
  );
}
