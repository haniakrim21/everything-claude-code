---
name: connect-apps-plugin
description: "Composio integration plugin that enables Claude to perform real actions in 500+ apps including Gmail, GitHub, Slack, Notion, Google Sheets, Jira, Linear, Discord, and more. Handles OAuth authentication and app connections automatically. Use this skill when Claude needs to interact with external apps and services."
---

# Connect Apps Plugin

Enables Claude to perform real actions in 500+ apps via Composio integration. Handles authentication and connections automatically.

## Setup

1. Get a free API key from [platform.composio.dev](https://platform.composio.dev)
2. Install the plugin:
   ```bash
   claude --plugin-dir ./connect-apps-plugin
   ```
3. Run setup:
   ```
   /connect-apps:setup
   ```
4. Restart Claude Code
5. Authorize apps via OAuth on first use

## Supported Actions

- **Email**: Send/receive via Gmail, Outlook
- **Issues**: Create/update on GitHub, GitLab, Jira, Linear
- **Messaging**: Post to Slack, Discord, Teams
- **Documents**: Read/write Notion, Google Docs
- **Spreadsheets**: Manage Google Sheets, Airtable
- **500+ more actions** across popular SaaS tools

## Usage

After setup, Claude can take real actions on your behalf:

```
Send me a test email at myemail@example.com
Create a GitHub issue for the bug we just found
Post a summary to #engineering in Slack
```

## How It Works

This plugin wraps Composio's action execution API. When Claude needs to interact with an external app:
1. Checks if the app is connected (prompts OAuth if not)
2. Executes the action via Composio's secure API
3. Returns the result to the conversation

## Reference

- [Composio Platform](https://platform.composio.dev)
- Supports all apps in the Composio catalog
