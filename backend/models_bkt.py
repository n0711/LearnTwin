from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, Tuple

@dataclass
class BKTParams:
    p_init: float = 0.2
    p_learn: float = 0.15
    p_slip: float = 0.1
    p_guess: float = 0.2

class BKT:
    """Minimal placeholder BKT; real math comes next."""
    def __init__(self, params: BKTParams | None = None, seed: int = 0) -> None:
        self.params = params or BKTParams()
        self.seed = seed
        self.state: Dict[Tuple[str, str], float] = {}

    def get_mastery(self, user_id: str, skill_id: str) -> float:
        return self.state.get((user_id, skill_id), self.params.p_init)

    def update(self, user_id: str, skill_id: str, is_correct: bool) -> float:
        m = self.get_mastery(user_id, skill_id)
        delta = self.params.p_learn * (1.0 if is_correct else -0.5)
        new_m = max(0.0, min(1.0, m + delta))
        self.state[(user_id, skill_id)] = new_m
        return new_m
