import os
from bson.json_util import dumps

from flask import jsonify, Flask, make_response
from flask_cors import CORS

import db

app = Flask("rlesports")
app.config["DEBUG"] = os.environ["ENV"] != "production"
cors = CORS(app)


@app.route('/api/tournaments', methods=['GET'])
def tournaments():
    res = make_response(dumps(db.get_tournaments()))
    res.mimetype = "application/json"
    return res


@app.route('/')
def hello():
    return "Hello, world!"


port = os.environ["PORT"] if os.environ["PORT"] else 5001

print(f"Running at port {port}")

app.run(port=port)
