import { POST } from "../app/api/jobs/route";
const origin = "http://localhost:3108";
const authorization =
  "Basic " +
  Buffer.from(
    `${process.env.REWORK_STAFF_USERNAME}:${process.env.REWORK_STAFF_PASSWORD}`,
  ).toString("base64");
const response = await POST(
  new Request(`${origin}/api/jobs?session=forged`, {
    method: "POST",
    headers: { authorization, origin, "content-type": "application/json" },
    body: JSON.stringify({
      id: process.argv[2],
      status: "Reserved",
      driverName: "Test Driver",
      driverPhone: "3035550100",
      carrierName: "Test Carrier",
      trailerNumber: process.argv[2],
      phoneIntake: { notes: "Synthetic concurrency test" },
    }),
  }),
);
console.log(response.status);
