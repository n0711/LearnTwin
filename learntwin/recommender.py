from __future__ import annotations
from heapq import nsmallest
from typing import List, Dict, Any, Iterable, Tuple
from .models_bkt import BKTModel as BKT

def _key_det(item: Dict[str, Any]) -> Tuple[str, str]:
    # Deterministic tie-break: (skill_id, item_id) as strings
    return (str(item.get("skill_id", "")), str(item.get("item_id", "")))

class Recommender:
    """
    Ranks items by (1 - mastery(skill_id)) descending.
    Lower mastery first, then deterministic tie-break on (skill_id, item_id).
    """
    def __init__(self, bkt: BKT | None = None, seed: int = 0):
        self.seed = seed
        self.bkt = bkt or BKT()  # default-internal BKT if one isn't provided

    def next_items(
        self,
        user_id: str,
        candidates: Iterable[Dict[str, Any]],
        k: int = 5
    ) -> List[Dict[str, Any]]:
        # Cache mastery per skill to avoid repeated lookups
        mastery_cache: Dict[str, float] = {}
        def scored_candidates():
            for c in candidates:
                if not isinstance(c, dict):
                    continue
                skill = str(c.get("skill_id", ""))
                if not skill or "item_id" not in c:
                    continue
                if skill not in mastery_cache:
                    mastery_cache[skill] = self.bkt.get_mastery(user_id, skill)
                score = 1.0 - mastery_cache[skill]
                yield score, _key_det(c), c

        # Stable top-k: O(n log(k + 1)) time and O(k + skills) space for k < n.
        # nsmallest keeps input order for equal keys without comparing the dicts.
        selected = nsmallest(
            max(0, int(k)), scored_candidates(), key=lambda t: (-t[0], t[1])
        )
        return [c for _, __, c in selected]

