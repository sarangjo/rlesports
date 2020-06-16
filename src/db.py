import pymongo
from typing import List
import os.path
import os
import json

if os.environ['DB_PASSWORD']:
    global password
    password = os.environ['DB_PASSWORD']
else:
    global password
    with open(os.path.join(os.path.dirname(__file__), "db.json")) as f:
        password = json.load(f)["password"]

client = pymongo.MongoClient(
    f"mongodb+srv://dbUser:{password}@cluster0.xhiax.mongodb.net/?retryWrites=true&w=majority")
db = client.rlesports


def upload_tournaments(processed: List):
    bulk_writes = [pymongo.ReplaceOne(
        {'name': tournament['name']}, tournament, upsert=True) for tournament in processed]
    result = db.tournaments.bulk_write(bulk_writes)
    print(
        f"Inserted {result.inserted_count}, Modified {result.modified_count}")


def get_tournaments():
    return list(db.tournaments.find())
