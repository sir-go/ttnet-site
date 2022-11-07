from flask import Blueprint, render_template


sbpay = Blueprint('sberpay', __name__,
                  template_folder='pay_templates',
                  static_folder='pay_static')


@sbpay.route('/pay/confirm', methods=['POST'])
def confirm():
    return render_template('confirmation.html')
