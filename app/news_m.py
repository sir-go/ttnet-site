from pymongo import MongoClient
from datetime import datetime


def add_news(title: str, content: str, sign: str):
    now = datetime.now()

    cfg = {
        'host': 'localhost',
        'db': 'ttnet',
        'usr': 'admin',
        'pwd': 'admin'
    }

    mdb = MongoClient('mongodb://{usr}:{pwd}@{host}/{db}'.format(**cfg))

    mdb[cfg['db']].news.insert_one({
        'time': now,
        'title': title,
        'name': 'n_' + now.strftime('%Y%m%d%H%M%S'),
        'sign': sign,
        'content': content
    })


if __name__ == '__main__':
    add_news('Заголовок', 'Текст новости', 'подпись в подвале')
