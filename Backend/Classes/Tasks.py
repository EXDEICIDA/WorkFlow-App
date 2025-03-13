from dotenv import load_dotenv
from Classes.DataConfig import DataConfig
import os

# Load environment variables once at module level
load_dotenv()

class TaskManager:
    def __init__(self):
          self._client = DataConfig.get_client()
        
    
    def create_task(self, title, description, priority, status, user_id):
        """Create a new task in the database."""
        try:
            task_data = {
                "title": title,
                "description": description,
                "priority": priority,
                "status": status,
                "user_id": user_id
            }
            
            response = self._client.table('tasks').insert(task_data).execute()
            
            if not response.data:
                raise Exception("Task creation failed")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to create task: {str(e)}")

    def fetch_tasks(self, user_id=None):
        """Fetch all tasks from the database for a specific user."""
        try:
            query = self._client.table('tasks').select('*')
            
            # Filter by user_id if provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            return response.data if response.data else []
        except Exception as e:
            raise Exception(f"Failed to fetch tasks: {str(e)}")

    def delete_task(self, task_id, user_id=None):
        """Delete a task from the database."""
        try:
            query = self._client.table('tasks').delete().eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Task deletion failed")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to delete task: {str(e)}")

    def update_task(self, task_id, data, user_id=None):
        """Update a task's title in the database."""
        try:
            query = self._client.table('tasks').update(data).eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Task update failed")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to update task: {str(e)}")
    
    
    def mark_task_completed(self, task_id, user_id=None):
        """Mark a task as completed in the database."""
        try:
            query = self._client.table('tasks').update({"status": "completed"}).eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Failed to mark task as completed")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to mark task as completed: {str(e)}")


    def set_status(self, task_id, status, user_id=None):
        """Set the status of a task in the database."""
        try:
            query = self._client.table('tasks').update({"status": status}).eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Failed to set task status")
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to set task status: {str(e)}")    
