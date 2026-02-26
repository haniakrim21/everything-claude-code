---
description: "Prime Claude's context by reading the README and listing all tracked project files to understand the project structure."
---

Read README.md, THEN run `git ls-files | grep -v -f (sed 's|^|^|; s|$|/|' .cursorignore | psub)` to understand the context of the project
