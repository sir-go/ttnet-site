from flask import Blueprint, render_template

tpay = Blueprint('trusted', __name__,
                 template_folder='tp_templates',
                 static_folder='tp_static')


@tpay.route('/tpay/confirm', methods=['POST'])
def confirm():
    return render_template('tp_confirmation.html')
