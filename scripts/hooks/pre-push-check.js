const input = JSON.parse(process.argv[2] || "{}");
const command = (input.command || "").trim();

if (!command.startsWith("git push")) {
  process.exit(0);
}

// Block force push to main/master — this is dangerous and should be a PR
if ((command.includes("--force") || command.includes("-f")) &&
    (command.includes("main") || command.includes("master"))) {
  console.log(
    JSON.stringify({
      decision: "block",
      reason: "Force pushing to main/master is blocked. Create a PR instead.",
    })
  );
  process.exit(0);
}

const warnings = [];

if (command.includes("--force") || command.includes("-f")) {
  warnings.push("Force push detected. This rewrites remote history and may affect collaborators.");
}

if (!command.includes("origin") && !command.includes("-u")) {
  warnings.push("No remote specified. Pushing to default remote.");
}

if (warnings.length > 0) {
  console.log(JSON.stringify({ warnings, command }));
} else {
  process.exit(0);
}
