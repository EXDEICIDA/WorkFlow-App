from Classes.DataConfig import DataConfig
class ScriptsManager:
    def __init__(self):
        self._client = DataConfig.get_client()


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
                
            return response.data[0]
            
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
            query = self._client.table('scripts').delete().eq('id', script_id)
            
            # Ensure the script belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Script not found or already deleted")
            
            return {"id": script_id, "message": "Script deleted successfully"}
        except Exception as e:
            raise Exception(f"Failed to delete script: {str(e)}")
        


    # TODO: Implement the optimization methods # type: ignore
    def edit_script(self, script_id, title, description, code, language, user_id=None):
        """Edit a script in the database."""
        try:
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
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to edit script: {str(e)}")    
    



    def display_data(self):
        # Placeholder for data display logic
        pass
