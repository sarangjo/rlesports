import pymongo
from typing import List
import os.path
import json

with open(os.path.join(os.path.dirname(__file__), "db.json")) as f:
    dbfile = json.load(f)

client = pymongo.MongoClient(
    f"mongodb+srv://dbUser:{dbfile['password']}@cluster0.xhiax.mongodb.net/?retryWrites=true&w=majority")
db = client[dbfile['db']]


def upload_tournaments(processed: List):
    bulk_writes = [pymongo.ReplaceOne(
        {'name': tournament['name']}, tournament, upsert=True) for tournament in processed]
    result = db.tournaments.bulk_write(bulk_writes)
    print(
        f"Inserted {result.inserted_count}, Modified {result.modified_count}")


def get_tournaments():
    return list(db.tournaments.find())
