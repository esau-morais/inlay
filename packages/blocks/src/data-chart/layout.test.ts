import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { niceTicks, squarify } from "./layout.ts";

describe("niceTicks", () => {
  it("covers the data with round steps", () => {
    const scale = niceTicks(0, 87);
    assert.deepEqual(scale.ticks, [0, 20, 40, 60, 80, 100]);
    assert.equal(scale.min, 0);
    assert.equal(scale.max, 100);
  });

  it("uses steps of 1, 2, 2.5 or 5 times a power of ten", () => {
    assert.deepEqual(niceTicks(0, 0.9).ticks, [0, 0.2, 0.4, 0.6, 0.8, 1]);
    assert.deepEqual(niceTicks(120, 340).ticks, [100, 150, 200, 250, 300, 350]);
  });

  it("spans zero when values are negative", () => {
    const scale = niceTicks(-42, 18);
    assert.ok(scale.min <= -42);
    assert.ok(scale.max >= 18);
    assert.ok(scale.ticks.includes(0));
  });

  it("gives a usable range when every value is the same", () => {
    const scale = niceTicks(5, 5);
    assert.ok(scale.min < 5 && scale.max > 5);
    assert.ok(scale.ticks.length >= 2);
  });

  it("gives a usable range for all zeros", () => {
    const scale = niceTicks(0, 0);
    assert.equal(scale.min, 0);
    assert.ok(scale.max > 0);
  });

  it("does not leak floating point noise into ticks", () => {
    for (const tick of niceTicks(0, 0.3).ticks) {
      assert.equal(tick, Number(tick.toPrecision(12)));
    }
  });
});

function area(rect: { width: number; height: number }) {
  return rect.width * rect.height;
}

describe("squarify", () => {
  it("returns one rectangle per value, in input order", () => {
    const rects = squarify([6, 6, 4, 3, 2, 2, 1], 100, 100);
    assert.equal(rects.length, 7);
    assert.deepEqual(
      rects.map((rect) => rect.index),
      [0, 1, 2, 3, 4, 5, 6],
    );
  });

  it("gives each rectangle an area proportional to its value", () => {
    const values = [6, 6, 4, 3, 2, 2, 1];
    const total = values.reduce((sum, value) => sum + value, 0);
    const rects = squarify(values, 100, 60);
    for (const rect of rects) {
      const expected = ((values[rect.index] ?? 0) / total) * 100 * 60;
      assert.ok(Math.abs(area(rect) - expected) < 1e-6);
    }
  });

  it("fills the box without overlap", () => {
    const rects = squarify([50, 20, 10, 10, 5, 3, 2], 100, 100);
    const covered = rects.reduce((sum, rect) => sum + area(rect), 0);
    assert.ok(Math.abs(covered - 10000) < 1e-6);
    for (const rect of rects) {
      assert.ok(rect.x >= -1e-9 && rect.y >= -1e-9);
      assert.ok(rect.x + rect.width <= 100 + 1e-9);
      assert.ok(rect.y + rect.height <= 100 + 1e-9);
    }
    for (const a of rects) {
      for (const b of rects) {
        if (a === b) continue;
        const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
        const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
        assert.ok(overlapX <= 1e-9 || overlapY <= 1e-9);
      }
    }
  });

  it("keeps tiles close to square", () => {
    const rects = squarify([6, 6, 4, 3, 2, 2, 1], 600, 400);
    for (const rect of rects) {
      const ratio = Math.max(rect.width / rect.height, rect.height / rect.width);
      assert.ok(ratio < 3.5, `ratio ${ratio}`);
    }
  });

  it("skips zero and negative values", () => {
    const rects = squarify([10, 0, -3, 5], 100, 100);
    assert.deepEqual(
      rects.map((rect) => rect.index),
      [0, 3],
    );
  });

  it("returns nothing for no positive values", () => {
    assert.deepEqual(squarify([], 100, 100), []);
    assert.deepEqual(squarify([0, 0], 100, 100), []);
  });
});
