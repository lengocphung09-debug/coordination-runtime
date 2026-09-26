# ARIS / ARIS-SUPER Benchmark Harness v1
Fail-closed harness for Step 38 onward.

The harness never treats a target self-description, expected hash, Library presence, or mock specialist as execution evidence.

GET /api/benchmark performs byte-level target identity binding.
POST /api/benchmark refuses empirical execution until identity and executable adapters are verified.

Expected target hashes are frozen in benchmark/target-manifest.json.
