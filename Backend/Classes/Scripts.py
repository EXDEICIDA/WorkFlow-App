from dotenv import load_dotenv
from Classes.ActivityModule import ActivityTracker
from Classes.DataConfig import DataConfig
import os

class ScriptsManager:
    def __init__(self):
        self._client = DataConfig.get_client()
        self._activity_tracker = ActivityTracker()


    def create_script(self, title, description, code, language, user_id):
        """Create a new script in the database."""
        try:
            script_data = {
                "title": title,
                "description": description,
                "code": code,
                "language": language,
                "user_id": user_id
            }
        
            response = self._client.table('scripts').insert(script_data).execute()
            
            if not response.data:
                raise Exception("Script creation failed")
            
            # Log activity
            script = response.data[0]
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="create",
                description=f"Created script '{title}' in {language}",
                related_item_id=script['id'],
                related_item_type="script"
            )
                
            return script
            
        except Exception as e:
            raise Exception(f"Failed to create script: {str(e)}")
        
        
    def fetch_scripts(self, user_id=None):
        """Fetch all scripts from the database for a specific user."""
        try:
            query = self._client.table('scripts').select('*')
            
            # Filter by user_id if provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to fetch scripts: {str(e)}")    


    def delete_script(self, script_id, user_id=None):
        """Delete a script from the database."""
        try:
            # Get script details before deletion for activity logging
            script_details = self._client.table('scripts').select('*').eq('id', script_id).execute()
            if not script_details.data or len(script_details.data) == 0:
                raise Exception("Script not found")
            
            script = script_details.data[0]
            
            query = self._client.table('scripts').delete().eq('id', script_id)
            
            # Ensure the script belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Script not found or already deleted")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="delete",
                description=f"Deleted script '{script['title']}'",
                related_item_id=script_id,
                related_item_type="script"
            )
            
            return {"id": script_id, "message": "Script deleted successfully"}
        except Exception as e:
            raise Exception(f"Failed to delete script: {str(e)}")
        


    # TODO: Implement the optimization methods # type: ignore
    def edit_script(self, script_id, title, description, code, language, user_id=None):
        """Edit a script in the database."""
        try:
            # Get script details before update for activity logging
            script_details = self._client.table('scripts').select('*').eq('id', script_id).execute()
            if not script_details.data or len(script_details.data) == 0:
                raise Exception("Script not found")
                
            script = script_details.data[0]
            
            # Only update fields that are provided (not None)
            update_data = {}
            if title is not None:
                update_data['title'] = title
            if description is not None:
                update_data['description'] = description
            if code is not None:
                update_data['code'] = code
            if language is not None:
                update_data['language'] = language
            
            query = self._client.table('scripts').update(update_data).eq('id', script_id)
            
            # Ensure the script belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Script not found or unauthorized")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="edit",
                description=f"Updated script '{script['title']}'",
                related_item_id=script_id,
                related_item_type="script"
            )
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to edit script: {str(e)}")
    



    def display_data(self):
        # Placeholder for data display logic
        pass
