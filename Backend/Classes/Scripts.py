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


    def process_data(self):
        # Example: Fetching scripts from a database table
        try:
            response = self._client.table('scripts').select('*').execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to process data: {str(e)}")

    def display_data(self):
        # Placeholder for data display logic
        pass
