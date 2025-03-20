from Classes.DataConfig import DataConfig

class ProjectManager:
    def __init__(self):
        self._client = DataConfig.get_client()
        
    def create_project(self, title, description="", status="Active", deadline=None, user_id=None):
        """
        Create a new project
        
        Args:
            title (str): Project title
            description (str, optional): Project description. Defaults to "".
            status (str, optional): Project status. Defaults to "Active".
            deadline (str, optional): Project deadline in ISO format. Defaults to None.
            user_id (str, optional): User ID. Defaults to None.
            
        Returns:
            dict: Created project data
        """
        try:
            # Create project in database
            data = {
                "title": title,
                "description": description,
                "status": status,
                "deadline": deadline,
                "user_id": user_id,
                "created_at": DataConfig.get_timestamp()
            }
            
            # Insert project into the database
            response = self._client.table("projects").insert(data).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                raise Exception("Failed to create project")
                
        except Exception as e:
            print(f"Error creating project: {e}")
            raise
            
    def fetch_projects(self, user_id=None):
        """
        Fetch all projects for a user
        
        Args:
            user_id (str, optional): User ID. Defaults to None.
            
        Returns:
            list: List of projects
        """
        try:
            query = self._client.table("projects").select("*")
            
            # Filter by user_id if provided
            if user_id:
                query = query.eq("user_id", user_id)
                
            # Order by created_at
            query = query.order("created_at", desc=True)
            
            response = query.execute()
            
            return response.data
            
        except Exception as e:
            print(f"Error fetching projects: {e}")
            raise
            
    def get_project(self, project_id, user_id=None):
        """
        Get a specific project
        
        Args:
            project_id (int): Project ID
            user_id (str, optional): User ID for authorization. Defaults to None.
            
        Returns:
            dict: Project data
        """
        try:
            query = self._client.table("projects").select("*").eq("id", project_id)
            
            # Filter by user_id if provided (for authorization)
            if user_id:
                query = query.eq("user_id", user_id)
                
            response = query.execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                raise Exception("Project not found")
                
        except Exception as e:
            print(f"Error getting project: {e}")
            raise
            
    def update_project(self, project_id, data, user_id=None):
        """
        Update a project
        
        Args:
            project_id (int): Project ID
            data (dict): Updated project data
            user_id (str, optional): User ID for authorization. Defaults to None.
            
        Returns:
            dict: Updated project data
        """
        try:
            # Verify project exists and belongs to user
            if user_id:
                existing = self.get_project(project_id, user_id)
            else:
                existing = self.get_project(project_id)
                
            # Update project in database
            update_data = {k: v for k, v in data.items() if k in ["title", "description", "status", "deadline"]}
            update_data["updated_at"] = DataConfig.get_timestamp()
            
            response = self._client.table("projects").update(update_data).eq("id", project_id).execute()
            
            if response.data and len(response.data) > 0:
                return response.data[0]
            else:
                raise Exception("Failed to update project")
                
        except Exception as e:
            print(f"Error updating project: {e}")
            raise
            
    def delete_project(self, project_id, user_id=None):
        """
        Delete a project
        
        Args:
            project_id (int): Project ID
            user_id (str, optional): User ID for authorization. Defaults to None.
            
        Returns:
            dict: Deleted project data
        """
        try:
            # Verify project exists and belongs to user
            if user_id:
                existing = self.get_project(project_id, user_id)
            else:
                existing = self.get_project(project_id)
                
            # Delete project from database
            response = self._client.table("projects").delete().eq("id", project_id).execute()
            
            return existing
            
        except Exception as e:
            print(f"Error deleting project: {e}")
            raise