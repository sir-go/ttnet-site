import datetime
import re

import misaka
from flask import request, Flask
from jinja2.filters import do_mark_safe

from app.emoji_dict import emoji_classes

sm_names = {
    'ok': 'odnoklassniki',
    'vk': 'vk',
    'youtube': 'youtube-play',
    'instagram': 'instagram',
    'twitter': 'twitter'
}

re_smlink_pattern = r"\[(?P<text>[^]]*)\]" \
                    r"\((?P<href>((\w+\:\/\/)*(\w+\.)*(?P<sm>" + \
                    r"|".join(sm_names.keys()) + \
                    r")\.[^)]*))\)"
re_smlink = re.compile(re_smlink_pattern, re.IGNORECASE)
sm_a_tmpl = '<a href = "{href}" class ="sm-link-{sm}">' \
            '<i class ="fa fa-{sm_class}" aria-hidden="true"></i> {text}</a>'


def map_globals(app: Flask):
    app.jinja_env.globals.update(dict(
        get_current_year=get_current_year,
        get_current_date=get_current_date,
        get_ip=get_ip
    ))
    app.jinja_env.filters.update(dict(
        emoji=emoji_filter,
        link=links_filter,
        md=markdown_filter,
        days_ago=days_ago_filter
    ))


def _sm_replace(m):
    return sm_a_tmpl.format(
        sm=m.group('sm'),
        sm_class=sm_names[m.group('sm')],
        href=m.group('href'),
        text=m.group('text')
    )


def links_filter(text):
    return re_smlink.sub(_sm_replace, text)


def emoji_filter(text):
    for em_alias, em_class in emoji_classes.items():
        text = text.replace(
            ':{}:'.format(em_alias),
            '<span class="{}"></span>'.format(em_class))
    return text


def markdown_filter(text):
    return do_mark_safe(
        misaka.html(
            emoji_filter(
                links_filter(
                    text
                )
            )
        )
    )


def get_current_year():
    return datetime.date.today().strftime("%Y")


def get_current_date():
    return datetime.date.today().day


def days_ago_filter(dt):
    today = datetime.date.today()
    t_delta = today - dt.date()
    if t_delta.days < 1:
        delta_text = 'сегодня'
    elif t_delta.days == 1:
        delta_text = 'вчера'
    elif t_delta.days == 2:
        delta_text = 'позавчера'
    else:
        return datetime.datetime.strftime(dt, '%d.%m.%Y %H:%M')

    return datetime.datetime.strftime(dt, '{} %H:%M'.format(delta_text))


def get_ip():
    if request.headers.getlist("X-Forwarded-For"):
        return request.headers.getlist("X-Forwarded-For")[0]
    else:
        return request.remote_addr
