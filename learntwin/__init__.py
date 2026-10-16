"""Public learning-analytics API."""
from .models_bkt import BKTModel as BKT, BKTParams
from .recommender import Recommender
from .recsys.recommender import Item

def next_items(*args, **kwargs):
    """Deprecated helper; instantiate Recommender instead."""
    raise NotImplementedError("Use Recommender(...).next_items(...) instead.")

__all__ = ["BKT", "BKTParams", "Recommender", "Item", "next_items"]
