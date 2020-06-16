from flask import jsonify, Flask, make_response
from flask_cors import CORS
from bson.json_util import dumps
import db

app = Flask("rlesports")
app.config["DEBUG"] = True
cors = CORS(app)


@app.route('/api/tournaments', methods=['GET'])
def tournaments():
    res = make_response(dumps(db.get_tournaments()))
    res.mimetype = "application/json"
    return res


app.run(port=5001)
