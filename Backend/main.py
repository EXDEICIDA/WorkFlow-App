from flask import Flask, jsonify, request
from flask_cors import CORS
from Classes.Tasks import TaskManager
from Classes.Scripts import ScriptsManager

app = Flask(__name__)
CORS(app)

# Initialize the TaskManager class
task_manager = TaskManager()
script_manager = ScriptsManager()

# Defining the API routes based on task operations
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

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    try:
        task = task_manager.delete_task(task_id)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    try:
        data = request.get_json()
        if not data :
            return jsonify({"error": "No data provided"}), 400
            
        task = task_manager.update_task(task_id, data)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/tasks/<int:task_id>/complete', methods=['PUT'])
def mark_task_completed(task_id):
    try:
        task = task_manager.mark_task_completed(task_id)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


# Script operations routes 

@app.route('/api/scripts', methods=['Post'])
def add_script():
    try:
        data = request.get_json()

        if not data or not data.get('title'):
            return jsonify({"error": "Title is required"}), 400


        language = data.get('language', 'Unknown')  # Default to 'Unknown' if not provided

        script = script_manager.create_script(
            title=data.get('title'),
            description=data.get('description', ''),
            code=data.get('code', ''),
            language=language
        )
        scripts = script_manager.fetch_scripts()
        return jsonify(scripts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500  

if __name__ == '__main__':
    app.run(debug=True, port=8080)
