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


   
# Auth Routes/Endpoints For User Authentication

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password') or not data.get('email'):
            return jsonify({"error": "Username, email, and password are required"}), 400
        
        # Changed from auth_manager.register to auth_manager.sign_up
        result = auth_manager.sign_up(
            email=data.get('email'),
            password=data.get('password'),
            username=data.get('username')
        )
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    try:
        data = request.get_json()
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({"error": "Email and password are required"}), 400
        
        # Changed from auth_manager.login to match the Auth class implementation
        result = auth_manager.login(
            email=data.get('email'),
            password=data.get('password')
        )
        
        if "error" in result:
            return jsonify(result), 401
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout_user():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token required"}), 400
        
        result = auth_manager.logout(token)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/user', methods=['GET'])
def get_user():
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"error": "Token required"}), 400
        
        user = auth_manager.get_user_from_token(token)
        if not user:
            return jsonify({"error": "Invalid token"}), 401
        
        return jsonify(user), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True, port=8080)
