from sys import stderr


def sberpay(app):
    try:
        from app.sberpay.controller import sbpay
    except ImportError as e:
        print(str(e), file=stderr)
        sbpay = None

    if sbpay is not None:
        app.register_blueprint(sbpay)


def tpay(app):
    try:
        from app.trusted.controller import tpay as _tpay
    except ImportError as e:
        print(str(e), file=stderr)
        _tpay = None

    if _tpay is not None:
        app.register_blueprint(_tpay)


def us_requests(app):
    try:
        from app.user_request.controller import reqs
    except ImportError as e:
        print(str(e), file=stderr)
        reqs = None

    if reqs is not None:
        app.register_blueprint(reqs)
