import re

from flask import Blueprint, flash

from app.user_request.forms import RequestForm

re_float = re.compile(r'-*\d+[.,]\d+')
re_int = re.compile(r'-*\d+')

reqs = Blueprint(
    'requests', __name__,
    template_folder='req_templates', static_folder='req_static')


def proc_form(fm_service=None):
    form = RequestForm(services=([fm_service] if fm_service else []))

    if form.validate_on_submit():
        flash('Sorry but this functionality is removed from '
              'the repo because of security reasons.')

    return None, form
