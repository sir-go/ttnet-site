import pytest
from app import create_app


@pytest.fixture
def app_client():
    yield create_app('test-conf.json').test_client()
