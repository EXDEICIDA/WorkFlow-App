from flask import Flask, jsonify, request
from flask_cors import CORS
from Classes.Tasks import TaskManager
from Classes.Scripts import ScriptsManager
from auth.AuthConfig import Auth

app = Flask(__name__)
CORS(app)

# Initializing The Manager Classes 
task_manager = TaskManager()
script_manager = ScriptsManager()
auth_manager = Auth()

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
    

@app.route('/api/tasks/<int:task_id>/status', methods=['PUT'])
def update_task_status(task_id):
    # Update the status of a task
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"error": "Status is required"}), 400
        
        task = task_manager.set_status(task_id, data['status'])
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Script operations routes 

@app.route('/api/scripts', methods=['POST'])
def add_script():
    try:
        data = request.get_json()

        if not data or not data.get('title'):
            return jsonify({"error": "Title is required"}), 400

        language = data.get('language', 'Unknown')  # Default to 'Unknown' if not provided

        # Create the new script
        script = script_manager.create_script(
            title=data.get('title'),
            description=data.get('description', ''),
            code=data.get('code', ''),
            language=language
        )

        # Return the newly created script
        return jsonify(script), 201  # 201 Created status code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/scripts', methods=['GET'])
def get_scripts():
    try:
        scripts = script_manager.fetch_scripts()
        return jsonify(scripts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scripts/<int:script_id>', methods=['DELETE'])
def delete_script(script_id):
    try:
        script = script_manager.delete_script(script_id)
        return jsonify(script), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


   
# Auth Routes For The App



if __name__ == '__main__':
    app.run(debug=True, port=8080)
