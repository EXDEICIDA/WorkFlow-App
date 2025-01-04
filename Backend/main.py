from flask import Flask, jsonify, request
from flask_cors import CORS
from Classes.Tasks import TaskManager

app = Flask(__name__)
CORS(app)

task_manager = TaskManager()

@app.route('/api/tasks', methods=['POST'])
def add_task():
    try:
        data = request.get_json()
        
        if not data or not data.get('title'):
            return jsonify({"error": "Title is required"}), 400
            
        task = task_manager.create_task(
            title=data.get('title'),
            description=data.get('description', ''),
            priority=data.get('priority', 'Medium'),
            status=data.get('status', 'Pending')
        )
        return jsonify(task), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = task_manager.fetch_tasks()
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)
