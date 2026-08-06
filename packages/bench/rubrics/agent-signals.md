# Agent harness signals

Complementary to product quality scores. Useful when comparing **Prime Agent vs Claude Code vs Codex** on the same task/model family.

| Signal | Description | Capture |
|---|---|---|
| wall_time | End-to-end seconds | runner |
| phase_time_build / validate | Per-phase | runner |
| tool_calls | Count if harness JSON exposes | adapter |
| tokens_in / tokens_out | Usage | adapter |
| recovery_events | Failed command followed by success | log parse (future) |
| handoff | Whether harness only wrote a prompt | adapter rawSummary |
| secret_incidents | Likely keys in tree | structural scan |
| bluff_risk | Claims done but runtime fails | status vs runtime |

These do not replace the 0–100 product rubric; they explain *why* harnesses diverge.
