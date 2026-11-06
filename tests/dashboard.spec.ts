import { test, expect, Page } from "@playwright/test";
import { milestones, weeks } from "../lib/curriculum";

test("curriculum covers exactly 24 weeks, 168 days, and 150 planned problems", () => {
  expect(weeks.map((w) => w.number)).toEqual(
    Array.from({ length: 24 }, (_, i) => i + 1),
  );
  expect(weeks.flatMap((w) => w.days).map((d) => d.day)).toEqual(
    Array.from({ length: 168 }, (_, i) => i + 1),
  );
  expect(
    weeks.every((w) => w.days.length === 7 && w.objectives.length >= 2),
  ).toBe(true);
  expect(new Set(weeks.flatMap((w) => w.days.map((d) => d.id))).size).toBe(168);
  expect(weeks.slice(0, 2).every((w) => w.newProblems === 0)).toBe(true);
  expect(weeks.reduce((n, w) => n + w.newProblems, 0)).toBe(150);
  expect(
    milestones.map((m) =>
      weeks.filter((w) => w.milestone === m.id).map((w) => w.number),
    ),
  ).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [9, 10],
    [11, 12],
    [13, 14, 15],
    [16, 17, 18],
    [19, 20, 21, 22],
    [23, 24],
  ]);
});

test("roadmap progress, personal notes, and backup persist without storing static lessons", async ({
  page,
}) => {
  await openWorkspace(page);
  await page
    .getByRole("button", { name: "Learning Roadmap", exact: true })
    .click();
  await expect(page.locator(".roadmap-milestone")).toHaveCount(10);
  const first = page.locator(".roadmap-milestone").first();
  await first.locator(".roadmap-week").first().locator("summary").click();
  const checks = first.locator(".roadmap-week").first().getByRole("checkbox");
  for (let i = 0; i < 7; i++) await checks.nth(i).check();
  await expect(first.locator(".milestone-summary strong")).toHaveText("50%");
  await expect(
    first.locator(".roadmap-week").first().locator(".week-count"),
  ).toHaveText("100% · 7/7");
  await page
    .getByLabel("Week 1 reflection", { exact: true })
    .fill("Review function return values.");
  await page
    .getByLabel("Milestone 0 personal notes", { exact: true })
    .fill("Practice C++ references next.");
  await page.reload();
  await page
    .getByRole("button", { name: "Learning Roadmap", exact: true })
    .click();
  await expect(first.locator(".milestone-summary strong")).toHaveText("50%");
  await expect(
    page.getByLabel("Milestone 0 personal notes", { exact: true }),
  ).toHaveValue("Practice C++ references next.");
  await first.locator(".roadmap-week").first().locator("summary").click();
  await expect(
    page.getByLabel("Week 1 reflection", { exact: true }),
  ).toHaveValue("Review function return values.");
  await expect(checks.first()).toBeChecked();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: "test-results/roadmap-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({ path: "test-results/roadmap-mobile.png" });
  const cache = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("quest-v2-guest")!),
  );
  expect(Object.keys(cache.data.roadmap).sort()).toEqual([
    "completedTaskIds",
    "notes",
  ]);
  expect(cache.data.roadmap.completedTaskIds).toHaveLength(7);
  expect(JSON.stringify(cache.data.roadmap)).not.toContain("Python essentials");
});

async function openWorkspace(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Ready for your next big leap?" }),
  ).toBeVisible();
}
test("local tasks, contribution events, timer refresh, and mobile layout", async ({
  page,
}) => {
  await openWorkspace(page);
  await expect(
    page.getByText("0 contributions", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Mark Get comfortable with Python basics complete",
      exact: true,
    })
    .click();
  await expect(page.getByText("1 contribution", { exact: true })).toBeVisible();
  await page
    .getByRole("button", {
      name: "Mark Get comfortable with Python basics incomplete",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Mark Get comfortable with Python basics complete",
      exact: true,
    })
    .click();
  await expect(page.getByText("1 contribution", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Start session", exact: true })
    .click();
  await expect(page.locator(".timer")).not.toHaveText("00:00:00", {
    timeout: 4000,
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Pause session", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save session", exact: true }).click();
  await expect(
    page.getByText("2 contributions", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/dashboard-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: "test-results/dashboard-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.getByRole("button", { name: "Add note", exact: true }).click();
  await page
    .getByLabel("Title", { exact: true })
    .fill("My first learning note");
  await page
    .getByLabel("Notes & understanding")
    .fill("Lists preserve insertion order.");
  await page.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "My first learning note" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await expect(page.getByText("Lists preserve insertion order.")).toBeVisible();
});

test("malformed backup is rejected without replacing the current data", async ({
  page,
}) => {
  await openWorkspace(page);
  await page
    .getByRole("button", { name: "Settings & Backup", exact: true })
    .click();
  await page.getByLabel("Import backup").setInputFiles({
    name: "broken.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"tasks":[]}'),
  });
  await expect(
    page.getByText(
      "This file is not a valid Quest backup. Your data was not changed.",
    ),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON backup" }).click();
  expect((await download).suggestedFilename()).toBe("rakib-quest-backup.json");
});

test("cloud saving waits for confirmation and stale revisions preserve a local draft (mocked Supabase)", async ({
  page,
}) => {
  const uid = "b1becabe-0178-4b86-a1cc-747808d44b21";
  const user = {
    id: uid,
    aud: "authenticated",
    role: "authenticated",
    email: "rakib@example.com",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const jwt = [
    { alg: "HS256", typ: "JWT" },
    {
      sub: uid,
      role: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
    "signature",
  ]
    .map((x) =>
      typeof x === "string"
        ? x
        : Buffer.from(JSON.stringify(x)).toString("base64url"),
    )
    .join(".");
  let row: { payload: Record<string, unknown>; revision: number } | null = null;
  let forceConflict = false;
  await page.route(
    "https://oqvakvwsohfjoceladiv.supabase.co/**",
    async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname.includes("/auth/v1/token"))
        return route.fulfill({
          json: {
            access_token: jwt,
            token_type: "bearer",
            expires_in: 3600,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            refresh_token: "test-refresh",
            user,
          },
        });
      if (url.pathname.includes("/auth/v1/user"))
        return route.fulfill({ json: user });
      if (url.pathname.includes("/rest/v1/quest_state")) {
        if (request.method() === "GET")
          return route.fulfill({ json: row ? [row] : [] });
        if (request.method() === "POST" || request.method() === "PATCH") {
          if (forceConflict) return route.fulfill({ json: [] });
          const body = request.postDataJSON();
          await new Promise((resolve) => setTimeout(resolve, 1200));
          row = { payload: body.payload, revision: body.revision };
          return route.fulfill({
            json:
              request.method() === "POST"
                ? { revision: row.revision }
                : [{ revision: row.revision }],
          });
        }
      }
      return route.fulfill({ json: {} });
    },
  );
  await openWorkspace(page);
  await page
    .getByRole("button", { name: "Settings & Backup", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill("rakib@example.com");
  await page.getByLabel("Password", { exact: true }).fill("test-password");
  await page.getByRole("button", { name: "Sign in to Supabase" }).click();
  await expect(page.locator(".signed-in")).toBeVisible();
  await expect(page.locator(".local-label")).toHaveText("Saving to Supabase…");
  await expect(page.locator(".local-label")).toHaveText("Saved to Supabase", {
    timeout: 10000,
  });
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Mark Get comfortable with Python basics complete",
      exact: true,
    })
    .click();
  await expect(page.locator(".local-label")).toHaveText("Saved to Supabase", {
    timeout: 10000,
  });
  expect(row).not.toBeNull();
  expect((row!.payload.tasks as { done: boolean }[])[0].done).toBe(true);
  await page
    .getByRole("button", { name: "Learning Roadmap", exact: true })
    .click();
  await page.locator(".roadmap-week").first().locator("summary").click();
  await page
    .getByRole("checkbox", {
      name: "Complete Day 1: Python essentials & a repeatable workflow",
      exact: true,
    })
    .check();
  await page
    .getByLabel("Week 1 reflection", { exact: true })
    .fill("Cloud roadmap note.");
  await expect(page.locator(".local-label")).toHaveText("Saved to Supabase", {
    timeout: 10000,
  });
  expect(row!.payload.roadmap).toEqual({
    completedTaskIds: ["w01-d1"],
    notes: { "week-1": "Cloud roadmap note." },
  });
  expect(JSON.stringify(row!.payload)).not.toContain("Python essentials");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  forceConflict = true;
  await page
    .getByRole("button", {
      name: "Mark Practice C++ input and output complete",
      exact: true,
    })
    .click();
  await expect(page.locator(".local-label")).toHaveText(
    "Unsynced local draft",
    { timeout: 10000 },
  );
  await page
    .getByRole("button", { name: "Settings & Backup", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Load cloud version" }),
  ).toBeVisible();
  const draft = await page.evaluate(
    (id) => JSON.parse(localStorage.getItem(`quest-v2-${id}`)!),
    uid,
  );
  expect(draft.data.tasks[1].done).toBe(true);
  expect((row!.payload.tasks as { done: boolean }[])[1].done).toBe(false);
});
