from dotenv import load_dotenv
from Classes.DataConfig import DataConfig
from Classes.ActivityModule import ActivityTracker
import os

# Load environment variables once at module level
load_dotenv()

class TaskManager:
    def __init__(self):
          self._client = DataConfig.get_client()
          self._activity_tracker = ActivityTracker()
        
    
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
            
            # Log activity
            task = response.data[0]
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="create",
                description=f"Created task '{title}' with {priority} priority",
                related_item_id=task['id'],
                related_item_type="task"
            )
                
            return task
            
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
            # Get task details before deletion for activity logging
            task_details = self._client.table('tasks').select('*').eq('id', task_id).execute()
            if not task_details.data or len(task_details.data) == 0:
                raise Exception("Task not found")
            
            task = task_details.data[0]
            
            query = self._client.table('tasks').delete().eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Task deletion failed")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="delete",
                description=f"Deleted task '{task['title']}'",
                related_item_id=task_id,
                related_item_type="task"
            )
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to delete task: {str(e)}")

    def update_task(self, task_id, data, user_id=None):
        """Update a task's title in the database."""
        try:
            # Get task details before update for activity logging
            task_details = self._client.table('tasks').select('*').eq('id', task_id).execute()
            if not task_details.data or len(task_details.data) == 0:
                raise Exception("Task not found")
            
            task = task_details.data[0]
            
            query = self._client.table('tasks').update(data).eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Task update failed")
            
            # Log activity
            updated_task = response.data[0]
            
            # Determine what was changed
            changes = []
            if data.get('title') and data['title'] != task['title']:
                changes.append("title")
            if data.get('description') and data['description'] != task['description']:
                changes.append("description")
            if data.get('priority') and data['priority'] != task['priority']:
                changes.append("priority")
            if data.get('status') and data['status'] != task['status']:
                changes.append("status")
            
            change_description = f"Updated task '{task['title']}'"
            if changes:
                change_description += f" ({', '.join(changes)})"
            
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="update",
                description=change_description,
                related_item_id=task_id,
                related_item_type="task"
            )
            
            return updated_task
        except Exception as e:
            raise Exception(f"Failed to update task: {str(e)}")
    
    
    def mark_task_completed(self, task_id, user_id=None):
        """Mark a task as completed in the database."""
        try:
            # Get task details before update for activity logging
            task_details = self._client.table('tasks').select('*').eq('id', task_id).execute()
            if not task_details.data or len(task_details.data) == 0:
                raise Exception("Task not found")
            
            task = task_details.data[0]
            
            query = self._client.table('tasks').update({"status": "completed"}).eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Failed to mark task as completed")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="complete",
                description=f"Completed task '{task['title']}'",
                related_item_id=task_id,
                related_item_type="task"
            )
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to mark task as completed: {str(e)}")


    def set_status(self, task_id, status, user_id=None):
        """Set the status of a task in the database."""
        try:
            # Get task details before update for activity logging
            task_details = self._client.table('tasks').select('*').eq('id', task_id).execute()
            if not task_details.data or len(task_details.data) == 0:
                raise Exception("Task not found")
            
            task = task_details.data[0]
            old_status = task['status']
            
            query = self._client.table('tasks').update({"status": status}).eq('id', task_id)
            
            # Ensure the task belongs to the user if user_id is provided
            if user_id:
                query = query.eq('user_id', user_id)
                
            response = query.execute()
            
            if not response.data:
                raise Exception("Failed to set task status")
            
            # Log activity
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="update",
                description=f"Changed task '{task['title']}' status from '{old_status}' to '{status}'",
                related_item_id=task_id,
                related_item_type="task"
            )
            
            return response.data[0]
        except Exception as e:
            raise Exception(f"Failed to set task status: {str(e)}")
