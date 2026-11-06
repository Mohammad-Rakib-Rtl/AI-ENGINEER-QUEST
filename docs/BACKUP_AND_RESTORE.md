# Backup and restore

## Export weekly

Open **Settings & Backup → Export JSON backup** in the workspace you want to preserve. Guest and signed-in records are separate. Keep the downloaded file in a dated folder, plus another copy in a safe location.

Exports contain the current device draft, tasks, text entries, total study hours, timer, target, and contribution events. They do not contain passwords or authentication tokens. Exporting unsynced changes is especially useful before resolving a conflict.

## Import

1. Choose the target workspace: stay signed out for guest storage or sign in for cloud storage.
2. Choose your JSON file under **Restore a backup**.
3. Confirm replacement. Import replaces the entire workspace rather than appending duplicate copies.
4. Wait for the save status; signed-in users should wait for **Saved to Supabase**.

Malformed files are rejected. Older exports without activity history are accepted with an empty calendar.

## Conflicting cloud changes

Export the local draft first. Then select **Load cloud version**, confirming that the local draft will be discarded. Compare the export with cloud content and re-add missing text manually. Importing the full export replaces cloud content, so only do that intentionally.

## Full database backup is different

JSON exports back up app records, not PostgreSQL schema or Supabase Auth users. Keep the SQL migration in Git. Provider database exports and account recovery are separate dashboard operations.
