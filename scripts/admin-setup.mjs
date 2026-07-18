#!/usr/bin/env node
// URY Dashboard — Admin Setup Script
// Applies branch protection rules and creates required labels on the fork repo.
//
// Usage:
//   GITHUB_TOKEN=<token> node scripts/admin-setup.mjs
//   GITHUB_TOKEN=<token> REPO=markec12345678/ury node scripts/admin-setup.mjs

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO || "markec12345678/ury";
const API = `https://api.github.com/repos/${REPO}`;
const HEADERS = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

if (!GITHUB_TOKEN) {
  console.error("ERROR: GITHUB_TOKEN environment variable is required");
  console.error("Usage: GITHUB_TOKEN=<token> node scripts/admin-setup.mjs");
  process.exit(1);
}

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...HEADERS, ...options.headers } });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${data.message || JSON.stringify(data)}`);
  }
  return data;
}

// ── Step 1: Apply branch protection ────────────────────────
async function applyBranchProtection() {
  console.log("\n🛡️  Step 1: Applying branch protection rules...\n");

  const branches = {
    develop: {
      required_status_checks: {
        strict: true,
        contexts: ["Lint & Type Check", "Storybook Build", "Build Verification"],
      },
      enforce_admins: false,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        required_approving_review_count: 1,
      },
      restrictions: null,
      required_linear_history: false,
      allow_force_pushes: false,
      allow_deletions: false,
    },
    main: {
      required_status_checks: {
        strict: true,
        contexts: ["Lint & Type Check", "Unit Tests", "Build Verification"],
      },
      enforce_admins: true,
      required_pull_request_reviews: {
        dismiss_stale_reviews: true,
        require_code_owner_reviews: true,
        required_approving_review_count: 2,
        require_last_push_approval: true,
      },
      restrictions: null,
      required_linear_history: true,
      allow_force_pushes: false,
      allow_deletions: false,
    },
  };

  for (const [branch, protection] of Object.entries(branches)) {
    try {
      await fetch(`${API}/branches/${branch}/protection`, {
        method: "PUT",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(protection),
      });
      console.log(`  ✅ Protected: ${branch}`);
    } catch (err) {
      console.error(`  ❌ Failed: ${branch}: ${err.message}`);
    }
  }
}

// ── Step 2: Add required labels ────────────────────────────
async function addRequiredLabels() {
  console.log("\n🏷️  Step 2: Creating required labels...\n");

  const labels = [
    { name: "bug", color: "d73a4a", description: "Something isn't working" },
    { name: "feature", color: "0075ca", description: "New feature or request" },
    { name: "question", color: "d876e3", description: "Further information requested" },
    { name: "ci", color: "0075ca", description: "Continuous Integration" },
    { name: "docker", color: "0e8a16", description: "Docker related changes" },
    { name: "storybook", color: "ff6f91", description: "Storybook component stories" },
    { name: "dependencies", color: "0366d6", description: "Dependency updates" },
    { name: "security", color: "b60205", description: "Security related" },
    { name: "documentation", color: "0075ca", description: "Documentation changes" },
    { name: "packages/ui", color: "c5def5", description: "UI package changes" },
    { name: "packages/core", color: "bfdadc", description: "Core package changes" },
    { name: "pos", color: "fef2c0", description: "POS app changes" },
    { name: "urypos", color: "d4c5f9", description: "URY POS legacy changes" },
    { name: "infra", color: "fbca04", description: "Infrastructure changes" },
    { name: "stale", color: "ededed", description: "No recent activity" },
  ];

  for (const label of labels) {
    try {
      await fetch(`${API}/labels`, {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify(label),
      });
      console.log(`  ✅ Created: ${label.name}`);
    } catch (err) {
      if (err.message?.includes("422")) {
        console.log(`  ⏭️  Already exists: ${label.name}`);
      } else {
        console.error(`  ❌ Failed: ${label.name}: ${err.message}`);
      }
    }
  }
}

// ── Step 3: Verify CI status ───────────────────────────────
async function verifyCI() {
  console.log("\n🔍 Step 3: Verifying recent CI status...\n");

  try {
    const { workflow_runs } = await fetchJSON(
      `${API}/actions/runs?per_page=5&branch=develop&status=completed`
    );

    for (const run of workflow_runs.slice(0, 5)) {
      const icon = run.conclusion === "success" ? "✅" : "❌";
      console.log(`  ${icon} ${run.name}: ${run.conclusion}`);
    }
  } catch (err) {
    console.error(`  ⚠️  Could not verify CI: ${err.message}`);
  }
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║   URY Repository Admin Setup Script      ║");
  console.log(`║   Repo: ${REPO.padEnd(32)}║`);
  console.log("╚══════════════════════════════════════════╝");

  try {
    await applyBranchProtection();
    await addRequiredLabels();
    await verifyCI();
  } catch (err) {
    console.error(`\n❌ Fatal error: ${err.message}`);
    process.exit(1);
  }

  console.log("\n✅ Admin setup complete!");
  console.log(`\nNext steps:`);
  console.log(`  1. Check CI: https://github.com/${REPO}/actions`);
  console.log(`  2. Settings: https://github.com/${REPO}/settings`);
  console.log(`  3. Storybook: https://github.com/${REPO}/tree/develop/packages/ui/src/components/__stories__`);
}

main();
