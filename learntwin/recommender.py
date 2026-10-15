from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Tuple

from .models_bkt import BKTModel

__all__ = ["Recommender"]


def _key_det(item: Dict[str, Any]) -> Tuple[str, str]:
    """Deterministic tie-break key: (skill_id, item_id) as strings."""
    return (str(item.get("skill_id", "")), str(item.get("item_id", "")))


class Recommender:
    """
    Mastery-based study recommender over candidate items.

    Ranks candidates by ``1 - mastery(skill_id)`` descending, so the learner's
    weakest skills surface first, with a deterministic tie-break on
    ``(skill_id, item_id)``. Candidates are plain dicts with at least
    ``item_id`` and ``skill_id``; malformed rows are skipped. If no BKT model is
    supplied, an internal default :class:`BKTModel` is used.
    """

    def __init__(self, bkt: Optional[BKTModel] = None, seed: int = 0) -> None:
        self.seed = seed
        self.bkt = bkt if bkt is not None else BKTModel()

    def next_items(
        self,
        user_id: str,
        candidates: Iterable[Dict[str, Any]],
        k: int = 5,
    ) -> List[Dict[str, Any]]:
        mastery_cache: Dict[str, float] = {}
        scored: List[Tuple[float, Tuple[str, str], Dict[str, Any]]] = []

        for c in candidates:
            skill = str(c.get("skill_id", ""))
            if not skill or "item_id" not in c:
                continue  # skip malformed candidates quietly
            if skill not in mastery_cache:
                mastery_cache[skill] = self.bkt.get_mastery(user_id, skill)
            score = 1.0 - mastery_cache[skill]  # lower mastery -> higher score
            scored.append((score, _key_det(c), c))

        # score descending, then deterministic tie-break ascending
        scored.sort(key=lambda t: (-t[0], t[1]))
        return [c for _, __, c in scored[: max(0, int(k))]]
