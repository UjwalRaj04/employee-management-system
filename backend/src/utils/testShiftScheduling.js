const assert = require("assert");
const {
    shiftsOverlap,
    availabilityCoversShift,
    mondayOfWeek,
    shiftSegments,
} = require("./shiftTime");

const morning = new Date("2026-10-26T09:00:00.000Z");
const afternoon = new Date("2026-10-26T13:00:00.000Z");
const evening = new Date("2026-10-26T17:00:00.000Z");
const later = new Date("2026-10-26T21:00:00.000Z");

assert.strictEqual(shiftsOverlap(morning, afternoon, afternoon, evening), false);
assert.strictEqual(shiftsOverlap(morning, evening, afternoon, later), true);

assert.strictEqual(mondayOfWeek("2026-10-23"), "2026-10-19");

const weekdaySlots = [
    { dayOfWeek: 1, isAvailable: true, startTime: "08:00", endTime: "16:00" },
];

assert.strictEqual(
    availabilityCoversShift(
        weekdaySlots,
        new Date("2026-10-26T09:00:00.000Z"),
        new Date("2026-10-26T15:00:00.000Z")
    ),
    true
);

assert.strictEqual(
    availabilityCoversShift(
        weekdaySlots,
        new Date("2026-10-26T09:00:00.000Z"),
        new Date("2026-10-26T18:00:00.000Z")
    ),
    false
);

const segments = shiftSegments(
    new Date("2026-10-26T09:00:00.000Z"),
    new Date("2026-10-26T15:00:00.000Z")
);

assert.strictEqual(segments.length, 1);
assert.strictEqual(segments[0].dayOfWeek, 1);

console.log("Shift scheduling checks passed");
