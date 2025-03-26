from Classes.DataConfig import DataConfig
from Classes.ActivityModule import ActivityTracker

class ItemsManager:
    def __init__(self):
        self._client = DataConfig.get_client()
        self._auth_token = None
        self._activity_tracker = ActivityTracker()
        
    def set_auth_token(self, auth_token):
        """Set the auth token for authenticated requests."""
        self._auth_token = auth_token
        
    def create_folder(self, name, parent_id, user_id):
        """Create a new folder in the database."""
        try:
            folder_data = {
                "name": name,
                "parent_id": parent_id,
                "user_id": user_id,
                "type": "folder"
            }
            
            # Ensure user_id is properly set for RLS
            if not user_id:
                raise Exception("User ID is required for folder creation")
                
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            response = client.table('items').insert(folder_data).execute()
            
            if not response.data:
                raise Exception("Folder creation failed")
            
            # Log activity
            folder = response.data[0]
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="create",
                description=f"Created folder '{name}'",
                related_item_id=folder['id'],
                related_item_type="folder"
            )
                
            return folder
            
        except Exception as e:
            raise Exception(f"Failed to create folder: {str(e)}")

    def create_file(self, name, file_type, file_url, parent_id, user_id, size=None):
        """Create a new file entry in the database."""
        try:
            file_data = {
                "name": name,
                "type": "file",
                "file_type": file_type,
                "file_url": file_url,
                "parent_id": parent_id,
                "user_id": user_id,
                "size": size
            }
            
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            response = client.table('items').insert(file_data).execute()
            
            if not response.data:
                raise Exception("File creation failed")
            
            # Log activity
            file = response.data[0]
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="create",
                description=f"Uploaded file '{name}'",
                related_item_id=file['id'],
                related_item_type="file"
            )
                
            return file
            
        except Exception as e:
            raise Exception(f"Failed to create file: {str(e)}")

    def fetch_items(self, user_id, parent_id=None):
        """Fetch all items (files and folders) from a specific folder for a user."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            query = client.table('items').select('*').eq('user_id', user_id)
            
            if parent_id is not None:
                query = query.eq('parent_id', parent_id)
            else:
                query = query.is_('parent_id', 'null')  # Root items
                
            response = query.execute()
            items = response.data if response.data else []
            
            # If we're at the root level, also fetch canvas items
            if parent_id is None:
                try:
                    # Check if there are any canvas items already in the items list
                    existing_canvas_ids = set()
                    for item in items:
                        if item.get('file_type') == 'canvas' and item.get('file_url'):
                            # Extract canvas ID from file_url if it follows the pattern /canvas/{id}
                            try:
                                canvas_id = item.get('file_url').split('/')[-1]
                                if canvas_id.isdigit():
                                    existing_canvas_ids.add(int(canvas_id))
                            except:
                                pass
                    
                    # Fetch all canvases for the user
                    canvas_response = client.table('canvas').select('*').eq('user_id', user_id).execute()
                    canvases = canvas_response.data if canvas_response.data else []
                    
                    # Convert canvas items to the same format as regular items, but only if they don't already exist
                    for canvas in canvases:
                        if canvas['id'] not in existing_canvas_ids:
                            canvas_item = {
                                "id": f"canvas_{canvas['id']}",  # Prefix to distinguish from regular items
                                "name": canvas['name'],
                                "type": "file",
                                "file_type": "canvas",
                                "file_url": f"/canvas/{canvas['id']}",  # URL format for canvas items
                                "user_id": canvas['user_id'],
                                "created_at": canvas['created_at'],
                                "updated_at": canvas['updated_at'],
                                "parent_id": None  # Canvas items are at root level
                            }
                            items.append(canvas_item)
                except Exception as e:
                    # Log the error but continue with regular items
                    print(f"Error fetching canvas items: {str(e)}")
            
            return items
            
        except Exception as e:
            raise Exception(f"Failed to fetch items: {str(e)}")

    def delete_item(self, item_id, user_id):
        """Delete an item (file or folder) from the database."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            
            # Get item details before deletion for activity logging
            item_details = client.table('items').select('*').eq('id', item_id).eq('user_id', user_id).execute()
            if not item_details.data:
                raise Exception("Item not found")
            
            item = item_details.data[0]
            
            # First check if it's a folder and has children
            children = client.table('items').select('id').eq('parent_id', item_id).execute()
            
            if children.data:
                # Recursively delete all children
                for child in children.data:
                    self.delete_item(child['id'], user_id)
            
            # Delete the item itself
            response = client.table('items').delete().eq('id', item_id).eq('user_id', user_id).execute()
            
            if not response.data:
                raise Exception("Item not found or already deleted")
            
            # Log activity
            item_type = "folder" if item['type'] == "folder" else "file"
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="delete",
                description=f"Deleted {item_type} '{item['name']}'",
                related_item_id=item_id,
                related_item_type=item_type
            )
            
            return {"id": item_id, "message": "Item deleted successfully"}
            
        except Exception as e:
            raise Exception(f"Failed to delete item: {str(e)}")

    def move_item(self, item_id, new_parent_id, user_id):
        """Move an item to a different folder."""
        try:
            update_data = {"parent_id": new_parent_id}
            
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            
            # Get item details before update for activity logging
            item_details = client.table('items').select('*').eq('id', item_id).eq('user_id', user_id).execute()
            if not item_details.data:
                raise Exception("Item not found")
            
            item = item_details.data[0]
            
            response = client.table('items').update(update_data)\
                .eq('id', item_id)\
                .eq('user_id', user_id)\
                .execute()
            
            if not response.data:
                raise Exception("Item not found or unauthorized")
            
            # Log activity
            item_type = "folder" if item['type'] == "folder" else "file"
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="move",
                description=f"Moved {item_type} '{item['name']}' to a different folder",
                related_item_id=item_id,
                related_item_type=item_type
            )
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to move item: {str(e)}")

    def rename_item(self, item_id, new_name, user_id):
        """Rename an item."""
        try:
            # Use auth client for RLS-protected operations
            client = DataConfig.get_auth_client(self._auth_token)
            
            # Get item details before update for activity logging
            item_details = client.table('items').select('*').eq('id', item_id).eq('user_id', user_id).execute()
            if not item_details.data:
                raise Exception("Item not found")
            
            item = item_details.data[0]
            old_name = item['name']
            
            update_data = {"name": new_name}
            response = client.table('items').update(update_data)\
                .eq('id', item_id)\
                .eq('user_id', user_id)\
                .execute()
            
            if not response.data:
                raise Exception("Item not found or unauthorized")
            
            # Log activity
            item_type = "folder" if item['type'] == "folder" else "file"
            self._activity_tracker.log_activity(
                user_id=user_id,
                activity_type="rename",
                description=f"Renamed {item_type} from '{old_name}' to '{new_name}'",
                related_item_id=item_id,
                related_item_type=item_type
            )
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to rename item: {str(e)}")