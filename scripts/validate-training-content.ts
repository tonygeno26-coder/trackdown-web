#!/usr/bin/env node
import { validateTrainingContent } from "../lib/training/content-validation";

const errors = validateTrainingContent();
if (errors.length > 0) {
  console.error("Training content validation failed:");
  for (const e of errors) console.error(`  [${e.source}] ${e.message}`);
  process.exit(1);
}
console.log("Training content validation passed.");
