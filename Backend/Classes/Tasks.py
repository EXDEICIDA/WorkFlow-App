from supabase import create_client
from dotenv import load_dotenv
import os

# Load environment variables once at module level
load_dotenv()

class TaskManager:
    def __init__(self):
        self._client = self._init_supabase()
        
    def _init_supabase(self):
        """Initialize Supabase client securely."""
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_KEY")
        
        if not url or not key:
            raise Exception("Database configuration missing")
            
        return create_client(url, key)
    
    def create_task(self, title, description, priority, status):
        """Create a new task in the database."""
        try:
            task_data = {
                "title": title,
                "description": description,
                "priority": priority,
                "status": status
            }
            
            response = self._client.table('tasks').insert(task_data).execute()
            
            if not response.data:
                raise Exception("Task creation failed")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to create task: {str(e)}")

    def fetch_tasks(self):
        """Fetch all tasks from the database."""
        try:
            response = self._client.table('tasks').select('*').execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to fetch tasks: {str(e)}")
