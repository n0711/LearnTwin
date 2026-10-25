"""Top-k ranking must match the previous stable full sort exactly."""
from random import Random

import pytest

from learntwin import BKT, Recommender


@pytest.mark.parametrize("k", [-3, 0, 1, 5, 2000, "7"])
def test_streaming_top_k_matches_stable_full_sort(k):
    rng = Random(17)
    bkt = BKT()
    for skill in ("s1", "s3"):
        bkt.update("user", skill, True)
    candidates = [
        {"skill_id": f"s{rng.randrange(5)}", "item_id": str(rng.randrange(30)), "row": i}
        for i in range(1000)
    ]
    candidates.extend([None, {}, {"skill_id": "s1"}, {"item_id": "missing"}])
    valid = [c for c in candidates if isinstance(c, dict) and c.get("skill_id") and "item_id" in c]
    expected = sorted(
        valid,
        key=lambda c: (bkt.get_mastery("user", c["skill_id"]) - 1.0, (c["skill_id"], c["item_id"])),
    )[:max(0, int(k))]
    result = Recommender(bkt).next_items("user", iter(candidates), k=k)
    assert result == expected
    assert all(actual is wanted for actual, wanted in zip(result, expected))


def test_equal_ranking_keys_keep_input_order_and_cache_mastery():
    class CountingBKT:
        def __init__(self):
            self.lookups = []

        def get_mastery(self, user, skill):
            self.lookups.append((user, skill))
            return 0.2

    bkt = CountingBKT()
    candidates = [{"skill_id": "same", "item_id": "same", "row": i} for i in range(30)]
    assert Recommender(bkt).next_items("u", iter(candidates), 5) == candidates[:5]
    assert bkt.lookups == [("u", "same")]
