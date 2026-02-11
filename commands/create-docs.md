Create the standard project documentation folder structure.

## Steps

1. Check if a `Docs/` directory already exists at the project root.
   - If it exists, report which subfolders are present and which are missing.
   - Create only the missing subfolders.
2. Create the `Docs/` directory (if needed) with these numbered subfolders:
   - `01-Discovery` - Research, competitive analysis, user interviews, market research
   - `02-Frameworks` - Technical frameworks, evaluation criteria, decision matrices
   - `03-PRDs` - Product Requirements Documents, feature specs, user stories
   - `04-Architecture` - System design, ADRs, diagrams, data models
   - `05-Design` - UI/UX designs, wireframes, mockups, design tokens
   - `06-Development` - Implementation notes, API docs, runbooks, coding guides
   - `07-Tests` - Test plans, test results, QA reports, coverage reports
   - `08-Feedback` - User feedback, retrospectives, review notes, surveys
   - `99-Archive` - Superseded or historical documents
3. Add a `.gitkeep` file in each empty subfolder so Git tracks them.
4. Report the created structure to the user.

## Rules

- Use `mkdir -p` to create directories idempotently (safe to re-run).
- Do NOT create README or index files inside the subfolders unless the user asks.
- Preserve any existing content in subfolders that already exist.
- This command is safe to run on any project at any time.
