from __future__ import annotations

import math

from learntwin import BKT
from learntwin.models_bkt import BKTParams


def test_correct_update_defaults_exact():
    # Defaults: p_init=0.2, p_learn(T)=0.15, p_slip(S)=0.1, p_guess(G)=0.2
    bkt = BKT(BKTParams())
    # correct from 0.2:
    # posterior = 0.2*0.9 / (0.2*0.9 + 0.8*0.2) = 0.18 / 0.34 = 0.5294117647
    # transition: 0.5294117647 + (1-0.5294117647)*0.15 = 0.6
    after = bkt.update("u1", "add", True)
    assert math.isclose(after, 0.6, abs_tol=1e-9)


def test_incorrect_update_defaults_exact():
    bkt = BKT(BKTParams())
    # incorrect from 0.2:
    # posterior = 0.2*0.1 / (0.2*0.1 + 0.8*(1-0.2)) = 0.02 / 0.66 = 0.03030303
    # transition: 0.03030303 + (1-0.03030303)*0.15 = 0.175757576
    after = bkt.update("u2", "sub", False)
    assert math.isclose(after, 0.175757576, abs_tol=1e-9)


def test_correct_beats_incorrect_from_same_prior():
    a = BKT(BKTParams()).update("u3", "mul", True)
    b = BKT(BKTParams()).update("u3", "mul", False)
    assert a > b
