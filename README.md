# TeleTime Ltd. web site
> Origin site: https://ttnet.ru

> ⚠️ **ATTENTION** ⚠️<br/>
the code is extremely **obsolete** and not suitable for third-party use 
> the only purpose of this repo is the **demonstration**

[![Tests](https://github.com/sir-go/ttnet-site/actions/workflows/python-app.yml/badge.svg)](https://github.com/sir-go/ttnet-site/actions/workflows/python-app.yml)

This is a Flask-based old-school web-site of TeleTime Ltd.
company.

## Includes
 - Jinja2-templated no-CMS engine
 - Sberbank Acquiring integration
 - UTM5 billing integration
 - enabling "trusted pay" feature on demand
 - Userside ERP integration
 - users requests automation (req-desk in ERP)
 - Yandex.Maps integration
 - daData integration
 - CCTV cams streaming

## Screencast
![](ttnet-sc.gif)

## Test, build and run
### Standalone
> Mongodb required

Edit `app/conf.json` config before start

```bash
virtualenv venv
source ./venv/bin/activate
pip install -r requirements.txt
python -m pytest && python run.py
```
will run the app on http://localhost:5000

### Docker
> prepare an `app-conf.json` config before run

```bash
docker compose up
```
will run the app on http://localhost:8081
