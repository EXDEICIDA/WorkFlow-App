from Classes.DataConfig import DataConfig
from Classes.ActivityModule import ActivityTracker

class CanvasManager:
   # Initialization
   def __init__(self):
        self._client = DataConfig.get_client()
        self._auth_token = None
        self._activity_tracker = ActivityTracker()
        
   def set_auth_token(self, auth_token):
        """Set the auth token for authenticated requests."""
        self._auth_token = auth_token
        
   def save_canvas(self, name, content, user_id, description=None):
        """Save a canvas to the database."""
        try:
            canvas_data = {
                "name": name,
                "content": content,
                "user_id": user_id,
                "description": description
            }
            
            # Ensure user_id is properly set for RLS
            if not user_id:
                raise Exception("User ID is required for canvas creation")
                
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            response = client.table('canvas').insert(canvas_data).execute()
            
            if not response.data:
                raise Exception("Canvas creation failed")
            
            # Log activity
            canvas = response.data[0]
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="create",
                description=f"Created canvas '{name}'",
                related_item_id=canvas['id'],
                related_item_type="canvas"
            )
                
            return canvas
            
        except Exception as e:
            raise Exception(f"Failed to save canvas: {str(e)}")
            
   def fetch_canvas(self, canvas_id, user_id):
        """Fetch a specific canvas by ID."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            response = client.table('canvas').select('*').eq('id', canvas_id).eq('user_id', user_id).execute()
            
            if not response.data:
                raise Exception("Canvas not found or access denied")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to fetch canvas: {str(e)}")
            
   def fetch_all_canvas(self, user_id):
        """Fetch all canvases for a user."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            response = client.table('canvas').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            
            return response.data if response.data else []
            
        except Exception as e:
            raise Exception(f"Failed to fetch canvases: {str(e)}")
            
   def update_canvas(self, canvas_id, updates, user_id):
        """Update a canvas."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            
            # Get canvas details before update for activity logging
            canvas_details = client.table('canvas').select('*').eq('id', canvas_id).eq('user_id', user_id).execute()
            if not canvas_details.data:
                raise Exception("Canvas not found or access denied")
            
            canvas = canvas_details.data[0]
            
            response = client.table('canvas').update(updates).eq('id', canvas_id).eq('user_id', user_id).execute()
            
            if not response.data:
                raise Exception("Canvas update failed")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="update",
                description=f"Updated canvas '{canvas['name']}'",
                related_item_id=canvas_id,
                related_item_type="canvas"
            )
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to update canvas: {str(e)}")
            
   def delete_canvas(self, canvas_id, user_id):
        """Delete a canvas."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            
            # Get canvas details before deletion for activity logging
            canvas_details = client.table('canvas').select('*').eq('id', canvas_id).eq('user_id', user_id).execute()
            if not canvas_details.data:
                raise Exception("Canvas not found or access denied")
            
            canvas = canvas_details.data[0]
            
            response = client.table('canvas').delete().eq('id', canvas_id).eq('user_id', user_id).execute()
            
            if not response.data:
                raise Exception("Canvas deletion failed")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="delete",
                description=f"Deleted canvas '{canvas['name']}'",
                related_item_id=canvas_id,
                related_item_type="canvas"
            )
                
            return {"id": canvas_id, "message": "Canvas deleted successfully"}
            
        except Exception as e:
            raise Exception(f"Failed to delete canvas: {str(e)}")
