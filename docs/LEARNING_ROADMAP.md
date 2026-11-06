# Weekly learning roadmap

Open **Learning Roadmap**, expand a milestone, then expand a week. Every week includes two learning objectives, seven concrete daily plans, completed/unfinished counts, progress, and a reflection field. Milestones also have their own notes and progress.

## Pacing

- Weeks 1–2 (Days 1–14): Python, C++, debugging, tests, and complexity fundamentals. These exercises earn no LeetCode problem credits.
- Weeks 3–4: array traversal, in-place operations, strings, and parsing.
- Weeks 5–6: sets, counting maps, grouping, and hash lookup patterns.
- Weeks 7–8: opposite/same-direction pointers, fixed windows, and variable windows.
- Weeks 9–10: prefix sums, subarray counting, and binary-search invariants.
- Weeks 11–12: stacks, queues, monotonic stacks, and linked-list mutation.
- Weeks 13–15: recursive thinking, backtracking basics, tree DFS/BFS, and BST reasoning.
- Weeks 16–18: heaps, graph modeling, traversal, dependencies, and connectivity.
- Weeks 19–22: greedy proofs, intervals, one- and two-dimensional DP, and mixed-pattern review.
- Weeks 23–24: mock interviews, systems foundations, and a reproducible LenKV experiment plan.

The default four-hour allocation is 45 minutes concept learning, 120 minutes implementation/problem solving, 45 minutes review or a C++ port, and 30 minutes testing, notes, and a commit. Use Python as the main solving language and port selected solutions to C++ rather than duplicating every attempt. Repeat a week if you need more time.

Weekly new-problem targets sum to 150 from Day 15 onward. These are planning targets; checking a day does not create a solved coding-problem record. Reattempts, language ports, and foundation exercises are not additional unique problems. Select Easy/Medium problems matching the topic and your current ability. The external LeetCode study plan is a topic reference, not the exact custom curriculum.

## Progress and saving

- A checkbox marks an entire daily plan complete. Milestone and overall percentages are derived from completed daily plans, not elapsed calendar time or solved-problem counts.
- Unchecking a plan lowers its progress. Completing it again on the same local day does not award duplicate contribution events.
- Weekly and milestone notes autosave through the existing workspace store. When signed in, wait for **Saved to Supabase**; when signed out, progress stays in this browser.
- JSON backup/export includes progress and notes. Older backups without roadmap data load with an empty roadmap while retaining existing records.

## Lightweight storage

The curriculum is defined once in `lib/curriculum.ts`, including week/day IDs, titles, objectives, and task descriptions. Supabase receives only this roadmap state inside the existing private `quest_state.payload`:

```json
{
  "roadmap": {
    "completedTaskIds": ["w01-d1", "w01-d2"],
    "notes": {
      "week-1": "Review function return values.",
      "milestone-0": "Practice const references."
    }
  }
}
```

No curriculum tables or daily seed records are created. No new migration is needed if `quest_state` is already configured. Keep IDs stable when revising curriculum wording so saved completion remains valid.
