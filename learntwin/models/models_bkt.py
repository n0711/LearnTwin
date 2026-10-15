from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, Dict, Tuple


@dataclass
class BKTParams:
    """Minimal placeholder parameters for BKT."""
    p_init: float = 0.2
    p_learn: float = 0.15
    p_slip: float = 0.1
    p_guess: float = 0.2


class BKTModel:
    """
    Bayesian Knowledge Tracing (standard two-parameter forward filter).

    Stores the probability of mastery ``p(L)`` per (user, skill). Each
    observation updates that probability with the guess/slip emission model and
    then applies the learning transition, exactly as in Corbett & Anderson
    (1995):

        correct:   p' = p(1-slip) / (p(1-slip) + (1-p)*guess)
        incorrect: p' = p*slip    / (p*slip    + (1-p)*(1-guess))
        learn:     p(L)_next = p' + (1 - p') * p_learn

    ``get_mastery`` returns the current p(L); ``p_init`` is the prior for an
    unseen (user, skill). Deterministic: identical observation streams yield
    identical estimates (the ``seed`` argument is accepted for API
    compatibility and does not introduce randomness).
    """
    def __init__(self, params: Optional[BKTParams] = None, seed: int = 0) -> None:
        self.params = params or BKTParams()
        self.seed = seed
        self._state: Dict[Tuple[str, str], float] = {}

    def get_mastery(self, user_id: str, skill_id: str) -> float:
        return self._state.get((user_id, skill_id), self.params.p_init)

    def update(self, user_id: str, skill_id: str, is_correct: bool) -> float:
        p = self.get_mastery(user_id, skill_id)
        slip, guess, learn = (
            self.params.p_slip,
            self.params.p_guess,
            self.params.p_learn,
        )
        if is_correct:
            numer = p * (1.0 - slip)
            posterior = numer / (numer + (1.0 - p) * guess)
        else:
            numer = p * slip
            posterior = numer / (numer + (1.0 - p) * (1.0 - guess))
        new_m = posterior + (1.0 - posterior) * learn
        new_m = max(0.0, min(1.0, new_m))
        self._state[(user_id, skill_id)] = new_m
        return new_m
