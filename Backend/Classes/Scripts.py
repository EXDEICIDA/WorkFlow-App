from Classes.DataConfig import DataConfig
class ScriptsManager:
    def __init__(self):
        self._client = DataConfig.get_client()


    def create_script(self, title, description, code, language):
        """Create a new script in the database."""
        try:
            script_data = {
                "title": title,
                "description": description,
                "code": code,
                "language": language
            }
        
            response = self._client.table('scripts').insert(script_data).execute()
            
            if not response.data:
                raise Exception("Script creation failed")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to create script: {str(e)}")
        
        
    def fetch_scripts(self):
        """Fetch all scripts from the database."""
        try:
            response = self._client.table('scripts').select('*').execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to fetch scripts: {str(e)}")    


    def delete_script(self, script_id):
        """Delete a script from the database."""
        try:
            response = self._client.table('scripts').delete().eq('id', script_id).execute()
            
            if not response.data:
                raise Exception("Script not found or already deleted")
            
            return {"id": script_id, "message": "Script deleted successfully"}
        except Exception as e:
            raise Exception(f"Failed to delete script: {str(e)}")
    



    def display_data(self):
        # Placeholder for data display logic
        pass
