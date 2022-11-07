import json

from flask import Flask, render_template, Response, current_app, make_response
from flask import redirect, url_for, request
from flask_wtf.csrf import CSRFProtect
import flask_pymongo as pmg
import logging

import app.jinja_lib
from app.user_request.controller import proc_form

import app.plugins


def create_app(conf_path: str) -> Flask:
    _app = Flask(__name__)

    _app.config.from_file(conf_path, load=json.load)

    CSRFProtect(_app)
    mongo = pmg.PyMongo(_app)
    jinja_lib.map_globals(_app)
    _app.url_map.strict_slashes = False

    plugins.sberpay(_app)
    plugins.us_requests(_app)
    plugins.tpay(_app)

    gunicorn_logger = logging.getLogger('gunicorn.error')
    _app.logger.handlers = gunicorn_logger.handlers
    _app.logger.setLevel(gunicorn_logger.level)

    @_app.route('/sitemap.xml')
    def sitemap():
        ignored = ['/sitemap.xml', '/tpay', '/tpay/confirm', '/pay',
                   '/pay/confirm', '/robots.txt', '/users']
        pages = []
        max_deep = 0

        for rule in current_app.url_map.iter_rules():
            if rule.rule not in ignored and "GET" in rule.methods and len(
                    rule.arguments) == 0:

                deep = rule.rule.count('/')
                if deep > max_deep:
                    max_deep = deep

                pages.append({'path': rule.rule, 'deep': deep})

        server_name = request.host_url.rstrip('/')
        sitemap_xml = render_template('sitemap.xml',
                                      pages=pages,
                                      server_name=server_name,
                                      max_deep=max_deep)
        response = make_response(sitemap_xml)
        response.headers["Content-Type"] = "application/xml"
        return response

    @_app.route('/robots.txt')
    def robots():
        server_name = request.host_url.rstrip('/')
        return Response(
            "User-agent: *\n"
            "Disallow: /pay\n"
            "Disallow: /pay/confirm\n"
            "Disallow: /tpay\n"
            "Disallow: /tpay/confirm\n"
            "Disallow: /blocked\n"
            "Disallow: /err50x\n"
            "Disallow: /q\n"
            "Sitemap: {}/sitemap.xml\n".format(server_name),
            mimetype="text/plain"
        )

    def _get_news_titles(amount=None):
        if mongo.db is None:
            return []
        if amount is not None:
            return mongo.db.news.find(
                {}, {'content': 0}).sort('time', pmg.DESCENDING).limit(amount)
        else:
            return mongo.db.news.find(
                {}, {'content': 0}).sort('time', pmg.DESCENDING)

    @_app.route('/')
    def index():
        return render_template("index.html", news_titles=_get_news_titles(3))

    @_app.route('/about')
    def about():
        return render_template("about/about.html",
                               news_titles=_get_news_titles(3))

    @_app.route('/users')
    def users():
        return redirect(url_for('users_internet'), 301)

    @_app.route('/users/help')
    def users_help():
        return render_template("users/help.html")

    @_app.route('/users/internet')
    def users_internet():
        return render_template(
            "users/internet.html",
            chat_data=mongo.db.chat_internet.find()
            if mongo.db is not None else {})

    @_app.route('/users/ctv')
    def users_ctv():
        return render_template(
            "users/ctv.html", chat_ctv=mongo.db.chat_ctv.find()
            if mongo.db is not None else {})

    @_app.route('/tariffs')
    def tariffs():
        return redirect(url_for('tariffs_internet'), 301)

    @_app.route('/tariffs/internet')
    def tariffs_internet():
        return render_template("tariffs/internet.html")

    @_app.route('/tariffs/ctv')
    def tariffs_ctv():
        return render_template("tariffs/ctv.html")

    @_app.route('/news')
    def news():
        news_posts = []
        news_titles = []
        if mongo.db is not None:
            news_posts = mongo.db.news.find(
                {}, {'caption': 0}).sort('time', pmg.DESCENDING)
            news_titles = _get_news_titles()
        return render_template(
            "news/news.html",
            news_posts=news_posts,
            news_titles=news_titles
        )

    @_app.route('/contacts')
    def contacts():
        return render_template("contacts/contacts.html",
                               news_titles=_get_news_titles(5))

    @_app.route('/connections', methods=['GET', 'POST'])
    def connections():
        result, form = proc_form(fm_service=request.args.get('s'))

        if request.method == 'POST' and result is not None:
            return redirect(url_for('connections'), 301)

        return render_template(
            "connections/connections.html",
            news_titles=_get_news_titles(5),
            form=form,
            ymap_api_key='0e88521d-5f94-4090-aa4f-7533819e596b'
        )

    @_app.route('/patriot')
    def patriot():
        return render_template("patriot/patriot.html",
                               news_titles=_get_news_titles(5))

    @_app.route('/cctv')
    def cctv():
        return render_template("cctv/leaflet.html")

    @_app.route('/cctv/faq')
    def cctv_faq():
        return render_template("cctv/faq.html",
                               cctv_faq=mongo.db.chat_cctv_faq.find())

    return _app


def standalone():
    return create_app('conf.json')
