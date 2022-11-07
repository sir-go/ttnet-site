import wtforms as wtf
from flask_wtf import FlaskForm
from wtforms import ValidationError
from wtforms import validators as vd
from wtforms.widgets import ListWidget, CheckboxInput


class RequiredIf(vd.DataRequired):
    def __init__(self, other_field_name, *args, **kwargs):
        self.other_field_name = other_field_name
        super().__init__(*args, **kwargs)

    # noinspection PyProtectedMember
    def __call__(self, form, field):
        other_field = form._fields.get(self.other_field_name)
        if other_field is None:
            raise Exception(
                'no field named "%s" in form' % self.other_field_name)
        if not bool(other_field.data):
            super().__call__(form, field)


# noinspection PyClassHasNoInit
class MultiCheckboxField(wtf.SelectMultipleField):
    widget = ListWidget(prefix_label=False)
    option_widget = CheckboxInput()


# noinspection PyUnusedLocal
def has_http(form, field):
    if 'http' in field.data:
        raise ValidationError('***')


class RequestForm(FlaskForm):
    services = MultiCheckboxField(
        'услуги', choices=[
            ('internet', 'Интернет'),
            ('tv', 'кабельное ТВ'),
            ('cctv', 'видеоконтроль')
        ],
        render_kw={"class": "cool-checkbox"})

    address = wtf.StringField(
        'по адресу', render_kw={
            "placeholder": "населённый пункт, улица, дом, квартира",
            "maxlength": 1000
        },
        validators=[
            vd.Length(max=1000, message='>1000 символов нельзя'),
            has_http
        ]
    )

    ddata = wtf.HiddenField()
    geo_zoom = wtf.HiddenField()
    geo_lat = wtf.HiddenField()
    geo_lon = wtf.HiddenField()
    geo_q = wtf.HiddenField()

    contacts = wtf.StringField(
        'Ваши контакты',
        validators=[
            vd.DataRequired('нам нужно знать, как с Вами связаться'),
            vd.Length(max=1000, message='>1000 символов нельзя')
        ],
        render_kw={
            "placeholder": "телефон, e-mail или любой другой контакт",
            "maxlength": 1000,
            # "required": True
        }
    )

    name = wtf.StringField(
        'Ваше имя',
        validators=[
            vd.Length(max=1000, message='>1000 символов нельзя')
        ],
        render_kw={
            "placeholder": "как к Вам обращаться?",
            "size": 20
        }
    )

    remark = wtf.TextAreaField(
        'комментарий',
        validators=[
            vd.Length(max=1000, message='>1000 символов нельзя'),
            has_http,
            RequiredIf('services',
                       'не выбрано ни одной услуги, что Вас интересует?')
        ],
        render_kw={
            "placeholder": "что мы можем для Вас сделать?",
            "rows": 3,
            "maxlength": 1000
        })
