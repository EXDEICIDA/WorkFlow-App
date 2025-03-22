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
            
            script_data = {
                "title": title,
                "description": description,
                "code": code,
                "language": language
            }
        
            query = self._client.table('scripts').update(script_data).eq('id', script_id)
            
            # Ensure the script belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Script not found or already deleted")
            
            # Log activity
            updated_script = response.data[0]
            
            # Determine what was changed
            changes = []
            if title != script['title']:
                changes.append("title")
            if description != script['description']:
                changes.append("description")
            if code != script['code']:
                changes.append("code")
            if language != script['language']:
                changes.append("language")
            
            change_description = f"Updated script '{script['title']}'"
            if changes:
                change_description += f" ({', '.join(changes)})"
            
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="update",
                description=change_description,
                related_item_id=script_id,
                related_item_type="script"
            )
                
            return updated_script
            
        except Exception as e:
            raise Exception(f"Failed to edit script: {str(e)}")    
    



    def display_data(self):
        # Placeholder for data display logic
        pass
