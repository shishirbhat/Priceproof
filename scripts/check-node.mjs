/**
 * Preflight Node version check.
 *
 * Vite 8 requires ^20.19.0 || >=22.12.0 and fails on older runtimes with an
 * error that does not name the actual problem. This says it plainly before
 * anything else runs.
 */
export function isSupported(version) {
  const [major, minor] = version.split(".").map(Number);
  // The 20.x line is supported from 20.19 up.
  if (major === 20) return minor >= 19;
  // 21.x was never a supported line for Vite 8.
  if (major === 22) return minor >= 12;
  return major > 22;
}

// Only complain when run directly, so the export stays testable.
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!isSupported(process.versions.node)) {
    console.error(
      [
        "",
        `  Node ${process.versions.node} is too old for this project.`,
        "",
        "  Vite 8 needs Node ^20.19.0 or >=22.12.0.",
        "",
        "  Fix it with nvm:",
        "    nvm install 22 && nvm use 22",
        "",
        "  Then run this command again.",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }
}
