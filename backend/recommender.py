from __future__ import annotations
from typing import List, Dict, Any, Iterable

class Recommender:
    """Stub next-items; deterministic ordering and tiny latency."""
    def __init__(self, seed: int = 0):
        self.seed = seed

    def next_items(
        self,
        user_id: str,
        candidates: Iterable[Dict[str, Any]],
        k: int = 5,
    ) -> List[Dict[str, Any]]:
        # Deterministic sort by (skill_id, item_id) for now.
        ordered = sorted(
            candidates,
            key=lambda c: (str(c.get("skill_id", "")), str(c.get("item_id", ""))),
        )
        return list(ordered[:k])
