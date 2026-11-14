#!/usr/bin/env node
// Validate bounded PNG assets without downloading or decoding their pixels.
import assert from "node:assert/strict";
import { lstatSync, readFileSync } from "node:fs";

const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_DIMENSION = 8192;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const files = ["branding/app-logo.png"];

for (const path of files) {
  const stat = lstatSync(path);
  assert.ok(stat.isFile() && !stat.isSymbolicLink(), `asset must be a regular file: ${path}`);
  assert.ok(stat.size >= 33 && stat.size <= MAX_FILE_BYTES, `asset size rejected: ${path}`);
  const bytes = readFileSync(path);
  assert.ok(bytes.subarray(0, 8).equals(PNG_SIGNATURE), `invalid PNG signature: ${path}`);
  assert.equal(bytes.readUInt32BE(8), 13, `PNG IHDR length mismatch: ${path}`);
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR", `PNG header chunk mismatch: ${path}`);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  assert.ok(width > 0 && height > 0 && width <= MAX_DIMENSION && height <= MAX_DIMENSION,
    `invalid PNG dimensions: ${path}`);
  console.log(`Validated ${path} (${width}x${height})`);
}
