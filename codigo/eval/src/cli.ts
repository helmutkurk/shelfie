import { execute } from "./execute.js";

// Usage: npm run eval -w @shelfie/eval -- [--mode stub|live|replay] [--labels f] [--photos dir]
//        [--out dir] [--replay results.json] [--synthetic|--no-synthetic]
//        [--cost-per-check 0.004] [--note text]
// Stub mode needs no keys. Live mode reads VISION_* from the environment (never printed).

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

const modeArg = arg("mode") ?? process.env["VERIFIER_MODE"] ?? "stub";
if (modeArg !== "stub" && modeArg !== "live" && modeArg !== "replay") {
  console.error(`unknown --mode ${modeArg}`);
  process.exit(2);
}
const cost = arg("cost-per-check");
const out = await execute({
  mode: modeArg,
  ...(arg("labels") ? { labelsPath: arg("labels") } : {}),
  ...(arg("photos") ? { photosDir: arg("photos") } : {}),
  ...(arg("out") ? { outDir: arg("out") } : {}),
  ...(arg("replay") ? { replayFrom: arg("replay") } : {}),
  ...(flag("synthetic") ? { synthetic: true } : flag("no-synthetic") ? { synthetic: false } : {}),
  ...(cost ? { costPerCheckEur: Number(cost) } : {}),
  ...(arg("note") ? { note: arg("note") } : {}),
  onEntry: (r) => {
    console.log(`${r.status === "ran" ? (r.matched ? "ok  " : "DIFF") : r.status.toUpperCase().padEnd(4)} ${r.file}`);
  },
});
console.log(out.markdown);
if (out.jsonPath) console.log(`written: ${out.jsonPath}\nwritten: ${out.mdPath ?? ""}`);
