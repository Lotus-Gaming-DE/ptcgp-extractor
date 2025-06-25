from src.pyutils.math_utils import add, async_add
import pytest


def test_add():
    assert add(1, 2) == 3


@pytest.mark.asyncio()
async def test_async_add():
    assert await async_add(2, 3) == 5
