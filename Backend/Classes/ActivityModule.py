from Classes.DataConfig import DataConfig
from datetime import datetime

class ActivityTracker:
    """
    Class to track user activities in the WorkFlow app.
    Activities are stored in the 'activities' table in Supabase.
    """
    
    def __init__(self):
        self.supabase = DataConfig.get_client()
    
    def log_activity(self, user_id, activity_type, description, related_item_id=None, related_item_type=None):
        """
        Log a user activity to the activities table.
        
        Args:
            user_id (str): The UUID of the user performing the activity
            activity_type (str): Type of activity (create, update, delete, etc.)
            description (str): Description of the activity
            related_item_id (int, optional): ID of the related item (project, script, etc.)
            related_item_type (str, optional): Type of the related item (project, script, etc.)
            
        Returns:
            dict: The created activity record or None if failed
        """
        try:
            activity_data = {
                "user_id": user_id,
                "activity_type": activity_type,
                "description": description,
                "related_item_id": related_item_id,
                "related_item_type": related_item_type
            }
            
            # Use authenticated client if available
            result = self.supabase.table("activities").insert(activity_data).execute()
            
            if result.data:
                return result.data[0]
            return None
        except Exception as e:
            print(f"Error logging activity: {str(e)}")
            return None
    
    def get_user_activities(self, user_id, limit=10):
        """
        Get recent activities for a specific user.
        
        Args:
            user_id (str): The UUID of the user
            limit (int): Maximum number of activities to return
            
        Returns:
            list: List of activity records
        """
        try:
            result = self.supabase.table("activities") \
                .select("*") \
                .eq("user_id", user_id) \
                .order("timestamp", desc=True) \
                .limit(limit) \
                .execute()
            
            return result.data
        except Exception as e:
            print(f"Error fetching user activities: {str(e)}")
            return []
            
    def get_auth_activities(self, auth_token, limit=10):
        """
        Get recent activities for the authenticated user.
        
        Args:
            auth_token (str): The authentication token
            limit (int): Maximum number of activities to return
            
        Returns:
            list: List of activity records
        """
        try:
            auth_client = DataConfig.get_auth_client(auth_token)
            result = auth_client.table("activities") \
                .select("*") \
                .order("timestamp", desc=True) \
                .limit(limit) \
                .execute()
            
            return result.data
        except Exception as e:
            print(f"Error fetching authenticated user activities: {str(e)}")
            return []