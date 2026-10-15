# Known issues

The full `pytest` suite currently passes (12 passed). Previously-open issues,
now resolved on branch `claude/fix-recommender-and-bkt`:

- **Suite could not be collected** — `tests/test_bkt_math.py` and
  `tests/test_recommender_mastery.py` placed `from __future__ import annotations`
  after another import, a `SyntaxError`. Fixed (future-import moved to the top).
- **`test_recommender_deterministic_sort`** — the public `learntwin.Recommender`
  is now the single mastery-based recommender (ranks by `1 - mastery`, with a
  deterministic `(skill_id, item_id)` tie-break). Passes.
- **Broken import** — `learntwin/recommender.py` imported a non-existent `BKT`
  from `learntwin.models_bkt`; it now imports `BKTModel`. Passes.
- **Placeholder BKT** — `BKTModel` is now a standard two-parameter Bayesian
  Knowledge Tracing forward filter (guess/slip posterior + learning transition),
  matching the exact-math tests (0.6 after a correct answer, 0.175758 after an
  incorrect one from the default prior).

## Notes for contributors
- There are two recommender APIs by design: the candidate-list
  `learntwin.Recommender` (per-request dicts) and the catalog-based
  `learntwin.recsys.recommender.Recommender` (fixed `Item` catalog).
- Next steps: coverage/threshold-aware scheduling (plain round-robin is a strong
  baseline), and fitting BKT parameters from data rather than using defaults.
