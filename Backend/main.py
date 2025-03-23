from flask import Flask, jsonify, request
from flask_cors import CORS
from Classes.Tasks import TaskManager
from Classes.Scripts import ScriptsManager
from Classes.Items import ItemsManager
from Classes.Projects import ProjectManager
from Classes.ActivityModule import ActivityTracker
from Classes.Events import EventManager
from auth.AuthConfig import Auth

app = Flask(__name__)
CORS(app)

# Initializing The Manager Classes 
task_manager = TaskManager()
script_manager = ScriptsManager()
items_manager = ItemsManager()
project_manager = ProjectManager()
auth_manager = Auth()
activity_tracker = ActivityTracker()
event_manager = EventManager()

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


   
# Items operations routes
@app.route('/api/items/folder', methods=['POST'])
@Auth.auth_required
def create_folder():
    try:
        data = request.get_json()
        if not data or not data.get('name'):
            return jsonify({"error": "Folder name is required"}), 400

        # Get auth token from request header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            items_manager.set_auth_token(token)

        folder = items_manager.create_folder(
            name=data.get('name'),
            parent_id=data.get('parent_id'),
            user_id=request.user.id
        )
        return jsonify(folder), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/file', methods=['POST'])
@Auth.auth_required
def create_file():
    try:
        data = request.get_json()
        if not data or not data.get('name') or not data.get('file_url'):
            return jsonify({"error": "File name and URL are required"}), 400

        # Get auth token from request header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            items_manager.set_auth_token(token)

        file = items_manager.create_file(
            name=data.get('name'),
            file_type=data.get('file_type', 'Other'),
            file_url=data.get('file_url'),
            parent_id=data.get('parent_id'),
            user_id=request.user.id,
            size=data.get('size')
        )
        return jsonify(file), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items', methods=['GET'])
@Auth.auth_required
def get_items():
    try:
        parent_id = request.args.get('parent_id')

        # Get auth token from request header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            items_manager.set_auth_token(token)

        items = items_manager.fetch_items(
            user_id=request.user.id,
            parent_id=parent_id
        )
        return jsonify(items), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/<item_id>', methods=['DELETE'])
@Auth.auth_required
def delete_item(item_id):
    try:
        # Get auth token from request header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            items_manager.set_auth_token(token)

        result = items_manager.delete_item(item_id, user_id=request.user.id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/<item_id>/move', methods=['PUT'])
@Auth.auth_required
def move_item(item_id):
    try:
        data = request.get_json()
        if not data or 'parent_id' not in data:
            return jsonify({"error": "Parent ID is required"}), 400

        # Get auth token from request header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            items_manager.set_auth_token(token)

        item = items_manager.move_item(
            item_id=item_id,
            new_parent_id=data['parent_id'],
            user_id=request.user.id
        )
        return jsonify(item), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/items/<item_id>/rename', methods=['PUT'])
@Auth.auth_required
def rename_item(item_id):
    try:
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({"error": "New name is required"}), 400

        # Get auth token from request header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            items_manager.set_auth_token(token)

        item = items_manager.rename_item(
            item_id=item_id,
            new_name=data['name'],
            user_id=request.user.id
        )
        return jsonify(item), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Project operations routes
@app.route('/api/projects', methods=['POST'])
@Auth.auth_required
def create_project():
    try:
        data = request.get_json()
        
        if not data or not data.get('title'):
            return jsonify({"error": "Title is required"}), 400
            
        project = project_manager.create_project(
            title=data.get('title'),
            description=data.get('description', ''),
            status=data.get('status', 'Active'),
            deadline=data.get('deadline'),
            user_id=request.user.id
        )
        return jsonify(project), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects', methods=['GET'])
@Auth.auth_required
def get_projects():
    try:
        projects = project_manager.fetch_projects(user_id=request.user.id)
        return jsonify(projects), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['GET'])
@Auth.auth_required
def get_project(project_id):
    try:
        project = project_manager.get_project(project_id, user_id=request.user.id)
        return jsonify(project), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
@Auth.auth_required
def update_project(project_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        project = project_manager.update_project(project_id, data, user_id=request.user.id)
        return jsonify(project), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
@Auth.auth_required
def delete_project(project_id):
    try:
        project = project_manager.delete_project(project_id, user_id=request.user.id)
        return jsonify(project), 200
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
        # Call the logout method from Auth class
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
        # Use the user object that was added to the request by the auth_required decorator
        user = request.user
        
        # Format the user data to return to the client
        user_data = {
            "id": user.id,
            "email": user.email,
            "full_name": user.user_metadata.get("full_name", ""),
            "created_at": user.created_at
        }
        
        return jsonify({"user": user_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Activities operations routes
@app.route('/api/activities', methods=['GET'])
@Auth.auth_required
def get_activities():
    try:
        # Get query parameters
        limit = request.args.get('limit', default=10, type=int)
        
        # Get auth token from request headers
        auth_header = request.headers.get('Authorization')
        auth_token = None
        if auth_header and auth_header.startswith('Bearer '):
            auth_token = auth_header.split(' ')[1]
        
        # Fetch activities for the authenticated user
        activities = activity_tracker.get_auth_activities(auth_token, limit=limit)
        
        return jsonify(activities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Events operations routes
@app.route('/api/events', methods=['POST'])
@Auth.auth_required
def create_event():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not data.get('title') or not data.get('start_date'):
            return jsonify({"error": "Title and start date are required"}), 400
            
        # Create the event
        event = event_manager.create_event(
            title=data.get('title'),
            description=data.get('description', ''),
            start_date=data.get('start_date'),
            end_date=data.get('end_date'),
            all_day=data.get('all_day', False),
            color=data.get('color', '#e6c980'),
            user_id=request.user.id
        )
        
        if "error" in event:
            return jsonify(event), 400
            
        return jsonify(event), 201
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events', methods=['GET'])
@Auth.auth_required
def get_events():
    try:
        # Get optional date range filters from query parameters
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        events = event_manager.fetch_events(
            user_id=request.user.id,
            start_date=start_date,
            end_date=end_date
        )
        
        if isinstance(events, dict) and "error" in events:
            return jsonify(events), 400
            
        return jsonify(events), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>', methods=['GET'])
@Auth.auth_required
def get_event(event_id):
    try:
        event = event_manager.get_event(event_id, user_id=request.user.id)
        
        if "error" in event:
            return jsonify(event), 404 if event["error"] == "Event not found" else 400
            
        return jsonify(event), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>', methods=['PUT'])
@Auth.auth_required
def update_event(event_id):
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        event = event_manager.update_event(event_id, data, user_id=request.user.id)
        
        if "error" in event:
            return jsonify(event), 404 if event["error"] == "Event not found" else 400
            
        return jsonify(event), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@Auth.auth_required
def delete_event(event_id):
    try:
        result = event_manager.delete_event(event_id, user_id=request.user.id)
        
        if "error" in result:
            return jsonify(result), 404 if result["error"] == "Event not found" else 400
            
        return jsonify(result), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8080)
