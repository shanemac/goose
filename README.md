# Goose

Goose is your co-founder. It learns what you're great at and does everything else, so you stay connected to your users and focused on what they actually say, not what you think.

Read the page: https://shanemac.github.io/goose/ · Read the brain: [files/](files/)

## Use Goose in any agent (MCP)

Goose is an MCP server. No hosting, no account, no API key. Needs Node 18+.

**Claude Code**

```
claude mcp add goose -- npx -y github:shanemac/goose
```

**Claude Desktop** (`claude_desktop_config.json`), **Cursor** (`~/.cursor/mcp.json` or `.cursor/mcp.json`), or any MCP client that takes JSON:

```json
{"mcpServers":{"goose":{"command":"npx","args":["-y","github:shanemac/goose"]}}}
```

## What you get

- **Instructions** that make your agent act as Goose: ship to production, honest product feedback over opinions, build a simpler version and get feedback every week, keep everything moving, clarify, and end every conversation pointed at a real person.
- **Resources:** every file in `files/` as `goose://soul`, `goose://mission`, `goose://values`, `goose://rituals`, `goose://routines`, `goose://responsibilities`, `goose://agent`, `goose://getting-started`, `goose://templates`.
- **Prompts:** `getting_started`, `morning_nudge`, `friday_review`, `monthly_check`, `clarify` (thing), `simpler_version` (building).
- **Tools:** `goose_soul` (returns the soul), `goose_check` (runs Goose's checklist on what you're working on: is it live, who used it, what did they do, the simpler version, what to cut, which human is next).

Read-only and stateless. It stores nothing and makes no network calls. Your agent keeps the company folder.

Made by [Shane Mac](https://shanemac.com).
