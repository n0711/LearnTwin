"""Top-level public API for LearnTwin.

- ``BKT`` / ``BKTParams``: Bayesian Knowledge Tracing model (mastery tracking).
- ``Recommender``: the canonical mastery-based recommender over candidate
  dicts (``{"item_id": ..., "skill_id": ...}``), ranking weakest skills first.
- ``Item``: the dataclass used by the catalog-based recommender in
  :mod:`learntwin.recsys.recommender`.

The catalog-based recommender remains available at
``learntwin.recsys.recommender.Recommender`` for callers that work from a fixed
item catalog rather than per-request candidate lists.
"""

from .models_bkt import BKTModel as BKT, BKTParams
from .recommender import Recommender
from .recsys.recommender import Item

__all__ = ["BKT", "BKTParams", "Recommender", "Item"]
