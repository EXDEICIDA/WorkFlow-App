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

# Token refresh endpoint
@app.route('/api/auth/refresh', methods=['POST'])
def refresh_token():
    try:
        data = request.get_json()
        if not data or not data.get('refresh_token'):
            return jsonify({"error": "Refresh token is required"}), 400
            
        result = auth_manager.refresh_token(data.get('refresh_token'))
        
        if "error" in result:
            return jsonify(result), 401
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Defining the API routes based on task operations
@app.route('/api/tasks', methods=['POST'])
@Auth.auth_required
def add_task():
    try:
        data = request.get_json()
        
        if not data or not data.get('title'):
            return jsonify({"error": "Title is required"}), 400
            
        task = task_manager.create_task(
            title=data.get('title'),
            description=data.get('description', ''),
            priority=data.get('priority', 'Medium'),
            status=data.get('status', 'Pending'),
            user_id=request.user.id
        )
        return jsonify(task), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks', methods=['GET'])
@Auth.auth_required
def get_tasks():
    try:
        tasks = task_manager.fetch_tasks(user_id=request.user.id)
        return jsonify(tasks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
@Auth.auth_required
def delete_task(task_id):
    try:
        task = task_manager.delete_task(task_id, user_id=request.user.id)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
@Auth.auth_required
def update_task(task_id):
    try:
        data = request.get_json()
        if not data :
            return jsonify({"error": "No data provided"}), 400
            
        task = task_manager.update_task(task_id, data, user_id=request.user.id)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/tasks/<int:task_id>/complete', methods=['PUT'])
@Auth.auth_required
def mark_task_completed(task_id):
    try:
        task = task_manager.mark_task_completed(task_id, user_id=request.user.id)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/tasks/<int:task_id>/status', methods=['PUT'])
@Auth.auth_required
def update_task_status(task_id):
    # Update the status of a task
    try:
        data = request.get_json()
        if not data or 'status' not in data:
            return jsonify({"error": "Status is required"}), 400
        
        task = task_manager.set_status(task_id, data['status'], user_id=request.user.id)
        return jsonify(task), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Script operations routes 

@app.route('/api/scripts', methods=['POST'])
@Auth.auth_required
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
            language=language,
            user_id=request.user.id
        )

        # Return the newly created script
        return jsonify(script), 201  # 201 Created status code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/scripts', methods=['GET'])
@Auth.auth_required
def get_scripts():
    try:
        scripts = script_manager.fetch_scripts(user_id=request.user.id)
        return jsonify(scripts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/scripts/<int:script_id>', methods=['DELETE'])
@Auth.auth_required
def delete_script(script_id):
    try:
        script = script_manager.delete_script(script_id, user_id=request.user.id)
        return jsonify(script), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/scripts/<int:script_id>/language', methods=['PUT'])
@Auth.auth_required
def update_script_language(script_id):
    try:
        data = request.get_json()
        if not data or 'language' not in data:
            return jsonify({"error": "Language is required"}), 400
        
        # Get the current script
        scripts = script_manager.fetch_scripts(user_id=request.user.id)
        script = next((s for s in scripts if s['id'] == script_id), None)
        
        if not script:
            return jsonify({"error": "Script not found"}), 404
            
        # Update the script with the new language
        updated_script = script_manager.edit_script(
            script_id=script_id,
            title=script['title'],
            description=script['description'],
            code=script['code'],
            language=data['language'],
            user_id=request.user.id
        )
        
        return jsonify(updated_script), 200
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
@Auth.auth_required
def logout_user():
    try:
        result = auth_manager.logout()
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/user', methods=['GET'])
@Auth.auth_required
def get_user():
    try:
        result = auth_manager.get_user(request.user.id)
        
        if "error" in result:
            return jsonify(result), 400
            
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8080)
