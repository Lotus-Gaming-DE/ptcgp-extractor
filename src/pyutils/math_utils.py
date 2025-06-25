"""Simple math utilities used for testing."""

from __future__ import annotations

import asyncio


def add(a: int, b: int) -> int:
    """Return the sum of *a* and *b*."""
    return a + b


async def async_add(a: int, b: int) -> int:
    """Asynchronously return the sum of *a* and *b*."""
    await asyncio.sleep(0)  # simulate async work
    return a + b
