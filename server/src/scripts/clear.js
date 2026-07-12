/**
 * Deletes ALL data from the database: projects, employees, users, and every
 * dependent collection (time entries, comments, files, expenses, AI history,
 * settings). This is destructive and irreversible.
 *
 * Run with: npm run clear
 * Run with: npm run clear -- --yes   (skips the confirmation prompt)
 */
import "dotenv/config";
import readline from "node:readline/promises";
import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import TimeEntry from "../models/TimeEntry.js";
import Comment from "../models/Comment.js";
import FileRecord from "../models/FileRecord.js";
import Expense from "../models/Expense.js";
import AiHistory from "../models/AiHistory.js";
import Settings from "../models/Settings.js";

async function confirm() {
  if (process.argv.includes("--yes")) return true;
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    "This will permanently delete ALL projects, employees, users, and related data. Type 'yes' to continue: "
  );
  rl.close();
  return answer.trim().toLowerCase() === "yes";
}

async function clear() {
  const ok = await confirm();
  if (!ok) {
    console.log("[clear] aborted — nothing was deleted.");
    process.exit(0);
  }

  await connectDB();

  const results = await Promise.all([
    Project.deleteMany({}),
    Employee.deleteMany({}),
    User.deleteMany({}),
    TimeEntry.deleteMany({}),
    Comment.deleteMany({}),
    FileRecord.deleteMany({}),
    Expense.deleteMany({}),
    AiHistory.deleteMany({}),
    Settings.deleteMany({}),
  ]);

  const [projects, employees, users, timeEntries, comments, files, expenses, aiHistory, settings] = results;

  console.log("[clear] deleted:");
  console.log(`  projects:     ${projects.deletedCount}`);
  console.log(`  employees:    ${employees.deletedCount}`);
  console.log(`  users:        ${users.deletedCount}`);
  console.log(`  time entries: ${timeEntries.deletedCount}`);
  console.log(`  comments:     ${comments.deletedCount}`);
  console.log(`  files:        ${files.deletedCount}`);
  console.log(`  expenses:     ${expenses.deletedCount}`);
  console.log(`  ai history:   ${aiHistory.deletedCount}`);
  console.log(`  settings:     ${settings.deletedCount}`);
  console.log("[clear] done. The database is now empty — register a new account to start fresh.");

  await disconnectDB();
  process.exit(0);
}

clear().catch((err) => {
  console.error("[clear] failed:", err);
  process.exit(1);
});
