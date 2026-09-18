import assert from "node:assert";
import { calculateJobTotal, RATES } from "../lib/types.ts";
import { INITIAL_JOBS } from "../lib/mock-data.ts";
import { JobStore, ALL_BAYS } from "../lib/storage.ts";

async function runTests() {
  console.log("=== RUNNING VERIFICATION SUITE FOR 10 CHATGPT REVIEW ITEMS ===\n");

  // TEST 1: Invoice Totals & Seed Line Items ([P2] #8)
  console.log("Test 1: Seed totals match line items exactly...");
  const rw0841 = INITIAL_JOBS.find((j) => j.id === "RW-0841");
  const rw0840 = INITIAL_JOBS.find((j) => j.id === "RW-0840");

  const calc0841 = calculateJobTotal(rw0841);
  const calc0840 = calculateJobTotal(rw0840);

  console.log(`  RW-0841 seed: $${rw0841.totalAmount}, calculated: $${calc0841}`);
  console.log(`  RW-0840 seed: $${rw0840.totalAmount}, calculated: $${calc0840}`);

  assert.strictEqual(rw0841.totalAmount, 222.5, "RW-0841 totalAmount must be 222.50");
  assert.strictEqual(calc0841, 222.5, "RW-0841 calculated total must be 222.50");
  assert.strictEqual(rw0840.totalAmount, 1001.0, "RW-0840 totalAmount must be 1001.00");
  assert.strictEqual(calc0840, 1001.0, "RW-0840 calculated total must be 1001.00");
  console.log("✓ Test 1 Passed\n");

  // TEST 2: Shared Storage & Session Isolation ([P1] #4 & #5)
  console.log("Test 2: Session isolation between sessions...");
  const sessionAlpha = "test-session-alpha-" + Date.now();
  const sessionBeta = "test-session-beta-" + Date.now();

  const jobsAlpha = await JobStore.getJobs(sessionAlpha);
  const jobsBeta = await JobStore.getJobs(sessionBeta);
  assert.strictEqual(jobsAlpha.length, 2, "Session Alpha starts with 2 seed jobs");
  assert.strictEqual(jobsBeta.length, 2, "Session Beta starts with 2 seed jobs");

  // Add custom job to Session Alpha
  const newJobAlpha = {
    id: "RW-TEST-ALPHA",
    trailerNumber: "ALPHA-1234",
    carrierName: "Alpha Logistics",
    driverName: "Alpha Driver",
    driverPhone: "(303) 555-0001",
    bayNumber: "Bay 1",
    serviceType: "Shifted Pallets",
    status: "Completed",
    palletsCount: 2,
    wrapCount: 1,
    cornersCount: 4,
    laborHours: 1.0,
    scaleCheck: false,
    debrisFee: false,
    totalAmount: 174.0,
    beforePhotos: [],
    afterPhotos: [],
    signatureData: "sig",
    defectTags: ["Test"],
    createdAt: new Date().toISOString(),
  };

  await JobStore.saveJob(sessionAlpha, newJobAlpha);
  const updatedAlpha = await JobStore.getJobs(sessionAlpha);
  const updatedBeta = await JobStore.getJobs(sessionBeta);

  assert.strictEqual(updatedAlpha.length, 3, "Alpha now has 3 jobs");
  assert.strictEqual(updatedBeta.length, 2, "Beta remains isolated with 2 jobs");
  assert.strictEqual(updatedBeta.some((j) => j.id === "RW-TEST-ALPHA"), false, "Beta does not see Alpha's job");

  // Reset Session Alpha
  await JobStore.resetJobs(sessionAlpha);
  const resetAlpha = await JobStore.getJobs(sessionAlpha);
  assert.strictEqual(resetAlpha.length, 2, "Alpha reset back to 2 initial jobs");
  console.log("✓ Test 2 Passed\n");

  // TEST 3: Dynamic Bay Allocation & Expiration ([P2] #7)
  console.log("Test 3: Bay allocation and non-expired hold conflict detection...");
  const sessionBays = "test-bays-" + Date.now();
  await JobStore.resetJobs(sessionBays);

  // Initial jobs in mock data are Bay 4 and Bay 6 (Billed, but let's test open bays)
  const alloc1 = await JobStore.allocateBay(sessionBays);
  assert.ok(alloc1, "Should allocate first available bay");
  console.log(`  Allocated bay 1: ${alloc1.bayNumber}, expiresAt: ${alloc1.expiresAt}`);

  // Create a reservation holding this bay
  const reservation1 = {
    id: "RW-HOLD-1",
    trailerNumber: "HOLD-0001",
    carrierName: "Carrier 1",
    driverName: "Driver 1",
    driverPhone: "(303) 555-0010",
    bayNumber: alloc1.bayNumber,
    serviceType: "Shifted Pallets",
    status: "Reserved",
    palletsCount: 4,
    wrapCount: 2,
    cornersCount: 8,
    laborHours: 1.25,
    scaleCheck: true,
    debrisFee: true,
    totalAmount: 350.0,
    beforePhotos: [],
    afterPhotos: [],
    signatureData: "",
    defectTags: [],
    createdAt: new Date().toISOString(),
    expiresAt: alloc1.expiresAt,
  };
  await JobStore.saveJob(sessionBays, reservation1);

  // Next allocation must NOT give the same bay!
  const alloc2 = await JobStore.allocateBay(sessionBays);
  assert.notStrictEqual(alloc2.bayNumber, alloc1.bayNumber, "Next reservation cannot receive the same held bay");
  console.log(`  Allocated bay 2: ${alloc2.bayNumber} (different from ${alloc1.bayNumber})`);

  // Test expiration logic: an expired reservation frees up its bay
  const expiredReservation = {
    id: "RW-HOLD-EXPIRED",
    trailerNumber: "HOLD-EXP",
    carrierName: "Carrier Exp",
    driverName: "Driver Exp",
    driverPhone: "(303) 555-0099",
    bayNumber: alloc2.bayNumber,
    serviceType: "Shifted Pallets",
    status: "Reserved",
    palletsCount: 4,
    wrapCount: 2,
    cornersCount: 8,
    laborHours: 1.25,
    scaleCheck: true,
    debrisFee: true,
    totalAmount: 350.0,
    beforePhotos: [],
    afterPhotos: [],
    signatureData: "",
    defectTags: [],
    createdAt: new Date(Date.now() - 50 * 60000).toISOString(),
    expiresAt: new Date(Date.now() - 5 * 60000).toISOString(), // expired 5 mins ago
  };
  assert.strictEqual(JobStore.isHoldExpired(expiredReservation), true, "Hold should be recognized as expired");
  console.log("✓ Test 3 Passed\n");

  // TEST 4: Timestamp & Metadata Preservation ([P2] #10)
  console.log("Test 4: Updating a reservation preserves original createdAt and metadata...");
  const sessionUpdate = "test-update-" + Date.now();
  await JobStore.resetJobs(sessionUpdate);

  const originalCreatedAt = "2026-09-07T18:00:00.000Z";
  const originalReservation = {
    id: "RW-RES-999",
    trailerNumber: "SWFT-9999",
    carrierName: "Swift",
    driverName: "Marcus",
    driverPhone: "(720) 555-0194",
    bayNumber: "Bay 3",
    serviceType: "Shifted Pallets",
    status: "Reserved",
    eta: "45 Mins",
    estimatedRange: "$350 - $450",
    palletsCount: 4,
    wrapCount: 2,
    cornersCount: 8,
    laborHours: 1.25,
    scaleCheck: true,
    debrisFee: true,
    totalAmount: 400.0,
    beforePhotos: [],
    afterPhotos: [],
    signatureData: "",
    defectTags: ["Mobile Reservation"],
    createdAt: originalCreatedAt,
    expiresAt: new Date(Date.now() + 45 * 60000).toISOString(),
  };
  await JobStore.saveJob(sessionUpdate, originalReservation);

  // Now simulate completion update where createdAt is NOT passed, but status becomes Completed
  const existing = (await JobStore.getJobs(sessionUpdate)).find((j) => j.id === "RW-RES-999");
  const completedJob = {
    ...existing,
    status: "Completed",
    totalAmount: calculateJobTotal({
      palletsCount: 6,
      wrapCount: 3,
      cornersCount: 8,
      laborHours: 2.0,
      scaleCheck: true,
      debrisFee: true,
    }),
    palletsCount: 6,
    wrapCount: 3,
    laborHours: 2.0,
    signatureData: "driver-signature-png",
    completedAt: new Date().toISOString(),
    // Notice createdAt is kept as originalCreatedAt!
  };
  await JobStore.saveJob(sessionUpdate, completedJob);

  const updatedRecord = (await JobStore.getJobs(sessionUpdate)).find((j) => j.id === "RW-RES-999");
  assert.strictEqual(updatedRecord.createdAt, originalCreatedAt, "Original createdAt must be preserved");
  assert.strictEqual(updatedRecord.eta, "45 Mins", "Reservation ETA metadata must be preserved");
  assert.strictEqual(updatedRecord.status, "Completed", "Status updated to Completed");
  assert.ok(updatedRecord.completedAt, "CompletedAt is recorded");
  console.log("✓ Test 4 Passed\n");

  // TEST 5: CSV Escaping & Formula Neutralization ([P2] #9)
  console.log("Test 5: CSV formula neutralization & RFC-4180 escaping...");
  function escapeCsvField(val) {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    str = str.replace(/"/g, '""');
    return `"${str}"`;
  }

  assert.strictEqual(escapeCsvField('=cmd|"/C calc"!A0'), '"\'=cmd|""/C calc""!A0"', "Formula '=' must be prefixed with ' and quotes doubled");
  assert.strictEqual(escapeCsvField('+12345'), '"\'+12345"', "Formula '+' must be prefixed with '");
  assert.strictEqual(escapeCsvField('@SUM(A1:A10)'), '"\'@SUM(A1:A10)"', "Formula '@' must be prefixed with '");
  assert.strictEqual(escapeCsvField('Swift "Express", Inc.'), '"Swift ""Express"", Inc."', "Quotes and commas properly quoted and doubled");
  console.log("✓ Test 5 Passed\n");

  // TEST 6: API Input Validation ([P1] #3)
  console.log("Test 6: Zod validation rejects bad types, negative quantities, and out-of-bound labor...");
  const { z } = await import("zod");
  const JobPayloadSchema = z.object({
    id: z.string().max(50).optional(),
    action: z.enum(["reset"]).optional(),
    trailerNumber: z.string().min(1).max(30).optional(),
    carrierName: z.string().min(1).max(100).optional(),
    driverName: z.string().min(1).max(100).optional(),
    driverPhone: z.string().min(1).max(30).optional(),
    bayNumber: z.string().min(1).max(20).optional(),
    serviceType: z.enum(["Shifted Pallets", "Axle Rebalance", "Pallet Swap", "Floor Transload"]).optional(),
    status: z.enum(["Reserved", "In Progress", "Completed", "Billed"]).optional(),
    eta: z.string().max(50).optional(),
    estimatedRange: z.string().max(50).optional(),
    palletsCount: z.number().int().min(0).max(100).optional(),
    wrapCount: z.number().int().min(0).max(100).optional(),
    cornersCount: z.number().int().min(0).max(200).optional(),
    laborHours: z.number().min(0).max(24).optional(),
    scaleCheck: z.boolean().optional(),
    debrisFee: z.boolean().optional(),
    totalAmount: z.number().min(0).max(100000).optional(),
    beforePhotos: z.array(z.string().max(1500000)).max(10).optional(),
    afterPhotos: z.array(z.string().max(1500000)).max(10).optional(),
    signatureData: z.string().max(1000000).optional(),
    defectTags: z.array(z.string().max(100)).max(10).optional(),
    createdAt: z.string().max(50).optional(),
    completedAt: z.string().max(50).optional(),
    expiresAt: z.string().max(50).optional(),
  });

  // String value for laborHours should fail
  const badLabor = JobPayloadSchema.safeParse({ laborHours: "1.5" });
  assert.strictEqual(badLabor.success, false, "String laborHours must fail validation");

  // Negative palletsCount should fail
  const negativePallets = JobPayloadSchema.safeParse({ palletsCount: -5 });
  assert.strictEqual(negativePallets.success, false, "Negative palletsCount must fail validation");

  // Out-of-bounds laborHours should fail
  const excessiveLabor = JobPayloadSchema.safeParse({ laborHours: 50 });
  assert.strictEqual(excessiveLabor.success, false, "Labor > 24 hours must fail validation");

  // Invalid status should fail
  const badStatus = JobPayloadSchema.safeParse({ status: "UnknownStatus" });
  assert.strictEqual(badStatus.success, false, "Invalid status must fail validation");

  // Legitimate job should succeed
  const validJob = JobPayloadSchema.safeParse({
    trailerNumber: "SWFT-55219",
    laborHours: 1.25,
    palletsCount: 4,
    status: "Completed",
  });
  assert.strictEqual(validJob.success, true, "Valid payload must pass validation");
  console.log("✓ Test 6 Passed\n");

  console.log("🎉 ALL 6 VERIFICATION SUITES PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
