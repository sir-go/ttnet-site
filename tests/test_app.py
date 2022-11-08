import pytest
from flask.testing import FlaskClient


@pytest.mark.parametrize('route', [
    '/',
    '/about',
    '/users/help',
    '/users/internet',
    '/users/ctv',
    '/tariffs/internet',
    '/tariffs/ctv',
    '/news',
    '/contacts',
    '/connections',
    '/patriot',
    '/cctv',
])
def test_get_html(app_client: FlaskClient, route: str):
    r = app_client.get(route)
    assert r.status_code == 200
    assert r.content_type == 'text/html; charset=utf-8'
    assert r.get_data(True).startswith('<!DOCTYPE html>')


@pytest.mark.parametrize('route', [
    '/users',
    '/tariffs',
])
def test_redirects(app_client: FlaskClient, route: str):
    r = app_client.get(route)
    assert r.status_code == 301


def test_sitemap(app_client: FlaskClient):
    r = app_client.get('/sitemap.xml')
    assert r.status_code == 200
    assert r.content_type == 'application/xml'


def test_robots(app_client: FlaskClient):
    r = app_client.get('/robots.txt')
    assert r.status_code == 200
    assert r.content_type == 'text/plain; charset=utf-8'
