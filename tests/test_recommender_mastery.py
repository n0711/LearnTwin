from __future__ import annotations

from learntwin import BKT, Recommender
from learntwin.models_bkt import BKTParams


def test_ranks_low_mastery_first_and_tiebreaks():
    # Make a BKT with known mastery: add=0.2 (default), sub raised after one correct
    b = BKT(BKTParams())  # prior add=0.2, sub=0.2
    b.update("u1", "sub", True)  # raise mastery for 'sub'
    rec = Recommender(bkt=b, seed=0)

    cands = [
        {"item_id": "i2", "skill_id": "add"},  # low mastery skill
        {"item_id": "i1", "skill_id": "add"},
        {"item_id": "i3", "skill_id": "sub"},  # higher mastery skill
    ]
    out = rec.next_items("u1", cands, k=3)
    # Items from 'add' should come before 'sub'. Inside 'add', tie-break on item_id ascending.
    assert [x["item_id"] for x in out] == ["i1", "i2", "i3"]


def test_empty_or_malformed_candidates_is_safe():
    rec = Recommender(BKT())
    assert rec.next_items("uX", [], k=5) == []
    # malformed rows get skipped
    bad = [{"skill_id": "add"}, {"item_id": "i1"}]
    assert rec.next_items("uX", bad, k=5) == []
