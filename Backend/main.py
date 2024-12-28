from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify({"users": ["apple", "banana", "cherry"]})

if __name__ == '__main__':
    app.run(debug=True, port=8080)
