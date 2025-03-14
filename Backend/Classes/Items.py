from Classes.DataConfig import DataConfig

class ItemsManager:
    def __init__(self):
        self._client = DataConfig.get_client()

    def create_folder(self, name, parent_id, user_id):
        """Create a new folder in the database."""
        try:
            folder_data = {
                "name": name,
                "parent_id": parent_id,
                "user_id": user_id,
                "type": "folder"
            }
            
            response = self._client.table('items').insert(folder_data).execute()
            
            if not response.data:
                raise Exception("Folder creation failed")
                
            return response.data[0]
            
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
            
            response = self._client.table('items').insert(file_data).execute()
            
            if not response.data:
                raise Exception("File creation failed")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to create file: {str(e)}")

    def fetch_items(self, user_id, parent_id=None):
        """Fetch all items (files and folders) from a specific folder for a user."""
        try:
            query = self._client.table('items').select('*').eq('user_id', user_id)
            
            if parent_id is not None:
                query = query.eq('parent_id', parent_id)
            else:
                query = query.is_('parent_id', 'null')  # Root items
                
            response = query.execute()
            return response.data if response.data else []
            
        except Exception as e:
            raise Exception(f"Failed to fetch items: {str(e)}")

    def delete_item(self, item_id, user_id):
        """Delete an item (file or folder) from the database."""
        try:
            # First check if it's a folder and has children
            children = self._client.table('items').select('id').eq('parent_id', item_id).execute()
            
            if children.data:
                # Recursively delete all children
                for child in children.data:
                    self.delete_item(child['id'], user_id)
            
            # Delete the item itself
            response = self._client.table('items').delete().eq('id', item_id).eq('user_id', user_id).execute()
            
            if not response.data:
                raise Exception("Item not found or already deleted")
            
            return {"id": item_id, "message": "Item deleted successfully"}
            
        except Exception as e:
            raise Exception(f"Failed to delete item: {str(e)}")

    def move_item(self, item_id, new_parent_id, user_id):
        """Move an item to a different folder."""
        try:
            update_data = {"parent_id": new_parent_id}
            
            response = self._client.table('items').update(update_data)\
                .eq('id', item_id)\
                .eq('user_id', user_id)\
                .execute()
            
            if not response.data:
                raise Exception("Item not found or unauthorized")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to move item: {str(e)}")

    def rename_item(self, item_id, new_name, user_id):
        """Rename an item."""
        try:
            update_data = {"name": new_name}
            
            response = self._client.table('items').update(update_data)\
                .eq('id', item_id)\
                .eq('user_id', user_id)\
                .execute()
            
            if not response.data:
                raise Exception("Item not found or unauthorized")
                
            return response.data[0]
            
        except Exception as e:
            raise Exception(f"Failed to rename item: {str(e)}")