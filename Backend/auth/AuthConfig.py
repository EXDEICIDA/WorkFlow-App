from Classes.DataConfig import DataConfig
from supabase import Client
from functools import wraps
from flask import request, jsonify

class Auth:
    """Handles user authentication with Supabase."""

    @staticmethod
    def sign_up(email: str, password: str, username: str):
        """Registers a new user using Supabase Auth."""
        client: Client = DataConfig.get_client()

        # Sign up user in Supabase Auth
        auth_response = client.auth.sign_up({
            "email": email, 
            "password": password,
            "options": {
                "data": {
                    "full_name": username  # This sets the Display name
                }
            }
        })

        user = auth_response.user
        if not user:
            return {"error": "Failed to create user"}

        return {"success": "User registered successfully.", "user_id": user.id}

       
    @staticmethod
    def login(email: str, password: str):
        """Authenticates a user and returns session details."""
        client: Client = DataConfig.get_client()

        try:
            # Sign in with email and password
            auth_response = client.auth.sign_in_with_password({
                "email": email, 
                "password": password
            })

            session = auth_response.session  # Corrected access
            if not session:
                return {"error": "Invalid credentials"}

            return {
                "success": "User logged in successfully.",
                "session": {
                    "access_token": session.access_token,
                    "refresh_token": session.refresh_token,
                    "user": {
                        "id": session.user.id,
                        "email": session.user.email
                    }
                }
            }
        except Exception as e:
            return {"error": str(e)}

    @staticmethod
    def update_user(user_id: str, new_username: str = None):
        """Updates user details (username only, as email update must be done via auth.users)."""
        client: Client = DataConfig.get_client()
        update_data = {}

        if new_username:
            update_data["username"] = new_username
        else:
            return {"error": "No data to update."}

        response = client.table("users").update(update_data).eq("id", user_id).execute()

        if hasattr(response, 'error') and response.error:
            return {"error": str(response.error)}

        return {"success": "User profile updated successfully."}

    @staticmethod
    def get_user(user_id: str):
        """Fetches user details from the database."""
        client: Client = DataConfig.get_client()

        response = client.table("users").select("*").eq("id", user_id).execute()

        if hasattr(response, 'error') and response.error:
            return {"error": str(response.error)}

        user_data = response.data
        if not user_data:
            return {"error": "User not found."}

        return {"user": user_data[0]}

    @staticmethod
    def logout():
        """Logs out the user and ends the session."""
        client: Client = DataConfig.get_client()
        response = client.auth.sign_out()

        if hasattr(response, 'error') and response.error:
            return {"error": str(response.error)}

        return {"success": "User logged out successfully."}

    @staticmethod
    def delete_user(user_id: str):
        """Deletes a user from authentication and the users table (Admin access required)."""
        client: Client = DataConfig.get_client()

        # Ensure you have admin privileges to delete users
        delete_response = client.auth.admin.delete_user(user_id)
        if hasattr(delete_response, 'error') and delete_response.error:
            return {"error": str(delete_response.error)}

        # Remove from the 'users' table
        db_response = client.table("users").delete().eq("id", user_id).execute()
        if hasattr(db_response, 'error') and db_response.error:
            return {"error": str(db_response.error)}

        return {"success": "User deleted successfully."}
        
    @staticmethod
    def verify_token(token: str):
        """Verifies a JWT token and returns the user information if valid."""
        client: Client = DataConfig.get_client()
        
        try:
            # Verify the token
            response = client.auth.get_user(token)
            if not response.user:
                return None
                
            return response.user
        except Exception:
            return None
            
    @staticmethod
    def refresh_token(refresh_token: str):
        """Refreshes an access token using a refresh token."""
        client: Client = DataConfig.get_client()
        
        try:
            response = client.auth.refresh_session(refresh_token)
            if not response.session:
                return {"error": "Failed to refresh token"}
                
            return {
                "access_token": response.session.access_token,
                "refresh_token": response.session.refresh_token
            }
        except Exception as e:
            return {"error": str(e)}
            
    @staticmethod
    def auth_required(f):
        """Decorator to protect routes that require authentication."""
        @wraps(f)
        def decorated(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({"error": "Authentication required"}), 401
                
            token = auth_header.split(' ')[1]
            user = Auth.verify_token(token)
            
            if not user:
                return jsonify({"error": "Invalid or expired token"}), 401
                
            # Add user to request context
            request.user = user
            return f(*args, **kwargs)
            
        return decorated
