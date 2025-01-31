from Classes.DataConfig import DataConfig
from supabase import Client

class Auth:
    """Handles user authentication with Supabase."""

    @staticmethod
    def sign_up(email: str, password: str, username: str):
        """Registers a new user and saves details in the 'users' table."""
        client: Client = DataConfig.get_client()

        # Sign up user in Supabase Auth
        auth_response = client.auth.sign_up({"email": email, "password": password})
        user = auth_response.get("user")  # Safe access

        if not user:
            return {"error": auth_response.get("error", {}).get("message", "Unknown error")}

        user_id = user.get("id")  # Get the UUID from auth.users

        if not user_id:
            return {"error": "User ID not returned from authentication."}

        # Store user details in the 'users' table
        data = {"id": user_id, "username": username, "email": email}
        db_response = client.table("users").insert(data).execute()

        if db_response.get("error"):
            return {"error": db_response["error"]["message"]}

        return {"success": "User registered successfully.", "user_id": user_id}

    @staticmethod
    def login(email: str, password: str):
        """Authenticates a user and returns session details."""
        client: Client = DataConfig.get_client()

        # Sign in with email and password
        auth_response = client.auth.sign_in_with_password({"email": email, "password": password})
        session = auth_response.get("session")  # Safe access

        if not session:
            return {"error": auth_response.get("error", {}).get("message", "Invalid credentials")}

        return {"success": "User logged in successfully.", "session": session}
