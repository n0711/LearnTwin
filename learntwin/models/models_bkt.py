from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Dict, Tuple


@dataclass
class BKTParams:
    """Bayesian Knowledge Tracing probabilities."""
    p_init: float = 0.2
    p_learn: float = 0.15
    p_slip: float = 0.1
    p_guess: float = 0.2


class BKTModel:
    """Per-user, per-skill Bayesian update followed by a learning transition."""
    def __init__(self, params: Optional[BKTParams] = None, seed: int = 0) -> None:
        self.params = params or BKTParams()
        for value in vars(self.params).values():
            if not 0.0 <= value <= 1.0:
                raise ValueError("BKT probabilities must lie in [0, 1]")
        self.seed = seed
        self._state: Dict[Tuple[str, str], float] = {}

    def get_mastery(self, user_id: str, skill_id: str) -> float:
        return self._state.get((user_id, skill_id), self.params.p_init)

    def update(self, user_id: str, skill_id: str, is_correct: bool) -> float:
        m = self.get_mastery(user_id, skill_id)
        p = self.params
        likelihood_known = 1.0 - p.p_slip if is_correct else p.p_slip
        likelihood_unknown = p.p_guess if is_correct else 1.0 - p.p_guess
        evidence = m * likelihood_known + (1.0 - m) * likelihood_unknown
        if evidence == 0.0:
            raise ValueError("Observation has zero probability under these BKT parameters")
        posterior = m * likelihood_known / evidence
        new_m = posterior + (1.0 - posterior) * p.p_learn
        self._state[(user_id, skill_id)] = new_m
        return new_m

