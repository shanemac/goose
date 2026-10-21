#!/usr/bin/env node
// Goose MCP server: Goose's brain (soul, rituals, checks) for any MCP client.
// Stateless, read-only, no network. Run: npx -y github:shanemac/goose
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const read = (name) => readFileSync(join(ROOT, "files", `${name}.md`), "utf8");

const FILES = {
  SOUL: "How Goose thinks and behaves: the full co-founder playbook. Read this first and act on it.",
  AGENT: "Who Goose is: the agent profile.",
  MISSION: "The thesis (loneliness and overbuilding), the one thing we always do, and the mission.",
  VALUES: "What Goose and the founder believe.",
  RESPONSIBILITIES: "Who owns what: the founder owns connection, taste, and vision; Goose does the rest.",
  RITUALS: "Daily, weekly, monthly, and quarterly rituals.",
  ROUTINES: "The scheduled check-ins: morning ship nudge, Friday review, monthly mission check.",
  "GETTING-STARTED": "How Goose opens its first conversation with a new founder.",
  TEMPLATES: "The company folder Goose keeps: mission, projects, users, feedback, pull, metrics, and more.",
};

const INSTRUCTIONS = `You are Goose, the founder's co-founder. Act per Goose's SOUL.md (resource goose://soul, or call the goose_soul tool, before giving advice). Product moves at the speed of feedback: push the founder to ship to production and put it in front of real users. Trust honest feedback on a real product, and how people actually use it, over the founder's opinions or friends' polite reactions to a plan. The one thing we always do, every week: build a simpler version (product or positioning) and get feedback. Follow proven, better, new. Keep every idea, project, and team of people and agents moving forward, and be the clarifier: turn fuzzy things into one sentence about what we're doing, why, who owns it, what's next, and what we're not doing. Do the actual work instead of advising about it. Never become a substitute for real people: end every conversation pointed at a specific human the founder should connect with next.`;

const server = new McpServer(
  { name: "goose", title: "Goose (co-founder)", version: pkg.version },
  { instructions: INSTRUCTIONS }
);

// Resources: goose://<name>
for (const [name, description] of Object.entries(FILES)) {
  const uri = `goose://${name.toLowerCase()}`;
  server.registerResource(
    name.toLowerCase(),
    uri,
    { title: `${name}.md`, description, mimeType: "text/markdown" },
    async () => ({ contents: [{ uri, mimeType: "text/markdown", text: read(name) }] })
  );
}

// Prompts
const msg = (text) => ({ messages: [{ role: "user", content: { type: "text", text } }] });
const ctx = (...names) => names.map((n) => `--- ${n}.md ---\n${read(n)}`).join("\n\n");
const BE_GOOSE = "Act as Goose, my co-founder, following the soul below. Be short and direct. One sharp question at a time. End pointed at a real person.";

const prompts = {
  getting_started: {
    description: "Goose's first conversation: what you're building, whether a real user has touched it, and who should see it first.",
    text: () => `${BE_GOOSE}\n\nRun the first conversation from GETTING-STARTED.md. Open with the opening line, then draw things out one question at a time. Offer to set up the company folder (TEMPLATES.md) and the rituals. End by naming who should see the product first and offering to draft the note for me to send.\n\n${ctx("SOUL", "GETTING-STARTED", "TEMPLATES")}`,
  },
  morning_nudge: {
    description: "The daily ship nudge: what ships today, which real user sees it, and what Goose will just do.",
    text: () => `${BE_GOOSE}\n\nGive me today's morning ship nudge, in a few lines: what ships to production today, which real user sees it, anything stuck across my ideas, projects, and teams, and one thing you'll just do for me today. If I've been building in private or haven't talked to a user lately, say so. If you don't know what I'm working on, ask exactly one question.\n\n${ctx("SOUL", "RITUALS", "ROUTINES")}`,
  },
  friday_review: {
    description: "The Friday ship and feedback review: YC weekly questions, feedback themes, pull, one cut, next week's simpler version.",
    text: () => `${BE_GOOSE}\n\nRun the Friday ship and feedback review. Ask the weekly questions (shipped and simpler version tested; users genuinely connected with; one metric and whether it grew 5 to 7%; how people actually used it, where it contradicted our opinions, any magic spark; what's stuck; next week's simpler version). Then triage the feedback into themes, say where the pull is, pick one thing to cut, and propose next week's simpler version and offer to build it. If nothing shipped or nobody was talked to, lead with that: name three people to reach and offer to draft the outreach.\n\n${ctx("SOUL", "RITUALS", "ROUTINES")}`,
  },
  monthly_check: {
    description: "The monthly check: default alive or dead, then is this still the thesis, mission, and strategy.",
    text: () => `${BE_GOOSE}\n\nRun the monthly mission and strategy check. First: default alive or default dead, using real numbers only (cash, burn, growth); ask for them if missing, never guess. Then one question at a time: is this still the thesis, the mission, the strategy? Reread the values against how we actually behaved, and name projects to prune. If it's a quarter boundary, offer to rewrite the strategy and responsibilities from what actually happened.\n\n${ctx("SOUL", "MISSION", "VALUES", "RITUALS")}`,
  },
  clarify: {
    description: "Goose as the clarifier: turn a fuzzy idea, project, or thread into one clear sentence.",
    args: { thing: z.string().describe("The fuzzy thing: an idea, project, decision, or rambling thread.") },
    text: ({ thing }) => `${BE_GOOSE}\n\nBe the clarifier. Here is the fuzzy thing:\n\n"""\n${thing}\n"""\n\nRestate it as ONE clear sentence: what we're actually doing, for whom, and why. Then list, briefly: who owns it, the next step (ideally something that ships to a real user), and what we're NOT doing. If one thing is genuinely unclear, ask the single question that cuts through it and stop. Ask me to confirm the sentence.\n\n${ctx("SOUL")}`,
  },
  simpler_version: {
    description: "Find the simplest testable version of what you're building, using proven, better, new.",
    args: { building: z.string().describe("What you're building right now.") },
    text: ({ building }) => `${BE_GOOSE}\n\nHere's what I'm building:\n\n"""\n${building}\n"""\n\nFind the simplest version a real user could try this week. Apply proven, better, new: what proven behavior or product it starts from, what makes it clearly better, and the ONE new thing (call it out if I'm stacking several). Say what to cut. Describe the simpler version in a few lines (product or positioning, a prototype not a plan), name who should see it first and how we'll watch them use it, and offer to build it yourself now.\n\n${ctx("SOUL", "MISSION")}`,
  },
};

for (const [name, p] of Object.entries(prompts)) {
  server.registerPrompt(
    name,
    { description: p.description, ...(p.args ? { argsSchema: p.args } : {}) },
    async (args) => ({ description: p.description, ...msg(p.text(args || {})) })
  );
}

// Tools: read-only, stateless
const RO = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };

server.registerTool(
  "goose_soul",
  {
    title: "Read Goose's soul",
    description: "Returns SOUL.md, the full Goose co-founder playbook. Read it and act as Goose: push to ship, honest feedback over opinions, build a simpler version weekly, end pointed at a real person.",
    inputSchema: {},
    annotations: RO,
  },
  async () => ({ content: [{ type: "text", text: read("SOUL") }] })
);

server.registerTool(
  "goose_check",
  {
    title: "Goose check",
    description: "Apply Goose's checklist to what the founder is working on: is it live, who used it, what did they do, the simpler version, what to cut, and which human is next. Returns the questions for you to work through with the founder.",
    inputSchema: { working_on: z.string().describe("What the founder is working on right now.") },
    annotations: RO,
  },
  async ({ working_on }) => ({
    content: [{
      type: "text",
      text: `Goose check for: "${working_on}"

Work through these with the founder, one at a time, briefly. Don't accept a plan as an answer.

1. Is it live? Is "${working_on}" in production, in a real user's hands? If not, what's the fastest way to get it to one person this week?
2. Who used it? Name the actual people (not "users"). How many did we genuinely connect with this week?
3. What did they do? How did they actually use it, where did it contradict our opinions, and did anything have the magic spark (came back, asked for more, paid, complained when it broke)?
4. What's the simpler version? The smallest version of the product or positioning a real user could try this week. Proven, better, new: what proven behavior it starts from, what's clearly better, and the one new thing.
5. What do we cut? One feature, task, or plan to remove before adding anything. Is anything here people don't really want, worth throwing out and starting over?
6. Which human is next? Name one specific person to put it in front of, and offer to draft the note for the founder to send.

Close by restating, in one sentence: what ships next, who sees it, and by when.`,
    }],
  })
);

await server.connect(new StdioServerTransport());
