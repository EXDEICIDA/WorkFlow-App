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

    def delete_task(self, task_id):
        """Delete a task from the database."""
        try:
            response = self._client.table('tasks').delete().eq('id', task_id).execute()
            
            if not response.data:
                raise Exception("Task deletion failed")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to delete task: {str(e)}")

    def update_task(self, task_id, data):
        """Update a task's title in the database."""
        try:
            response = self._client.table('tasks')\
                 .update(data)\
                 .eq('id', task_id)\
                 .execute()
            
            if not response.data:
                raise Exception("Task update failed")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to update task: {str(e)}")
    
    
    def mark_task_completed(self, task_id):
        """Mark a task as completed in the database."""
        try:
            response = self._client.table('tasks')\
                .update({"status": "completed"})\
                .eq('id', task_id)\
                .execute()
            
            if not response.data:
                raise Exception("Failed to mark task as completed")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to mark task as completed: {str(e)}")
    

   
