import pytest
from learntwin import BKT, BKTParams, Recommender


def test_mastery_order_wins_over_alphabetical_order():
    bkt = BKT()
    bkt.update('student', 'strong', True)
    rec = Recommender(bkt)
    candidates = [
        {'item_id': 'a', 'skill_id': 'strong'},
        {'item_id': 'z', 'skill_id': 'weak'},
    ]
    assert [x['item_id'] for x in rec.next_items('student', candidates)] == ['z', 'a']
    assert rec.next_items('student', candidates, k=0) == []


def test_invalid_probabilities_and_impossible_observation():
    with pytest.raises(ValueError):
        BKT(BKTParams(p_init=1.1))
    bkt = BKT(BKTParams(p_init=1, p_slip=0))
    with pytest.raises(ValueError):
        bkt.update('student', 'skill', False)
