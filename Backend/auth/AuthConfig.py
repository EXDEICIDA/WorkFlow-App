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

   
    @staticmethod
    def reset_password(email: str):
        """Sends a password reset email to the user."""
        client: Client = DataConfig.get_client()

        # Send password reset email
        response = client.auth.api.reset_password_for_email(email)

        if response.get("error"):
            return {"error": response["error"]["message"]}

        return {"success": "Password reset email sent."}
    

   
    @staticmethod
    def update_password(user_id: str, new_username: str = None, new_email: str = None):
        """Updates user details such as username or email."""
        client: Client = DataConfig.get_client()
        update_data = {}

        if new_username:
           update_data["username"] = new_username
        if new_email:
          update_data["email"] = new_email

        if not update_data:
           return {"error": "No data to update."}

        response = client.table("users").update(update_data).eq("id", user_id).execute()

        if response.get("error"):
          return {"error": response["error"]["message"]}

        return {"success": "User profile updated successfully."}
    

    @staticmethod
    def get_user(user_id: str):
        """Fetches user details from the database."""
        client: Client = DataConfig.get_client()

        response = client.table("users").select("*").eq("id", user_id).execute()

        if response.get("error"):
            return {"error": response["error"]["message"]}

        user_data = response.get("data")
        if not user_data:
          return {"error": "User not found."}

        return {"user": user_data[0]}
    

    @staticmethod
    def logout():
      """Logs out the user and ends the session."""
      client: Client = DataConfig.get_client()
      response = client.auth.sign_out()

      if response.get("error"):
        return {"error": response["error"]["message"]}

      return {"success": "User logged out successfully."}
    

    @staticmethod
    def delete_user(user_id: str):
       """Deletes a user account and removes them from the database."""
       client: Client = DataConfig.get_client()

     # First, delete from the Supabase users table
       delete_response = client.auth.admin.delete_user(user_id)
       if delete_response.get("error"):
        return {"error": delete_response["error"]["message"]}

    # Then, remove from the 'users' table
       db_response = client.table("users").delete().eq("id", user_id).execute()
       if db_response.get("error"):
        return {"error": db_response["error"]["message"]}

       return {"success": "User deleted successfully."}




  