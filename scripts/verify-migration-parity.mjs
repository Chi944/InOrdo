const maximumLedgerBytes = 256 * 1024;
const maximumLedgerRows = 1_000;

function fail(message, exitCode) {
  process.stderr.write(`${message}\n`);
  process.exit(exitCode);
}

const expectedTail = process.env.EXPECTED_MIGRATION_TAIL ?? "";
if (!/^\d{14}$/.test(expectedTail)) {
  fail("Expected migration tail must be exactly 14 digits.", 2);
}

const ledgerJson = process.env.LEDGER_JSON ?? "";
if (Buffer.byteLength(ledgerJson, "utf8") > maximumLedgerBytes) {
  fail("Unexpected Supabase migration ledger size.", 4);
}

let ledger;
try {
  ledger = JSON.parse(ledgerJson);
} catch {
  fail("Unexpected Supabase migration ledger JSON.", 4);
}

if (
  ledger === null ||
  typeof ledger !== "object" ||
  Array.isArray(ledger) ||
  Object.keys(ledger).sort().join(",") !== "message,migrations" ||
  !Array.isArray(ledger.migrations) ||
  ledger.message !== "Migrations listed"
) {
  fail("Unexpected Supabase migration ledger envelope.", 4);
}

if (ledger.migrations.length > maximumLedgerRows) {
  fail("Unexpected Supabase migration ledger size.", 4);
}

for (const entry of ledger.migrations) {
  if (
    entry === null ||
    typeof entry !== "object" ||
    Array.isArray(entry) ||
    Object.keys(entry).sort().join(",") !== "local,remote,time" ||
    typeof entry.local !== "string" ||
    typeof entry.remote !== "string" ||
    typeof entry.time !== "string" ||
    (entry.local !== "" && !/^\d{14}$/.test(entry.local)) ||
    (entry.remote !== "" && !/^\d{14}$/.test(entry.remote)) ||
    (entry.local === "" && entry.remote === "") ||
    !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(entry.time)
  ) {
    fail("Unexpected Supabase migration ledger row.", 4);
  }
}

if (ledger.migrations.some((entry) => entry.local !== entry.remote)) {
  fail("Supabase migration ledger is not aligned.", 5);
}

for (let index = 1; index < ledger.migrations.length; index += 1) {
  if (ledger.migrations[index].local <= ledger.migrations[index - 1].local) {
    fail("Unexpected Supabase migration ledger order.", 4);
  }
}

const finalEntry = ledger.migrations.at(-1);
if (finalEntry?.local !== expectedTail) {
  fail("Expected migration tail is not the final aligned migration.", 6);
}

process.stdout.write("Supabase migration parity verified.\n");
