from Classes.DataConfig import DataConfig

class EventManager:
    def __init__(self):
        self._client = DataConfig.get_client()
        
    def create_event(self, title, description, start_date, end_date, all_day, color, user_id):
        """Creates a new event for the user."""
        try:
            # Prepare the event data
            event_data = {
                "title": title,
                "description": description,
                "start_date": start_date,
                "end_date": end_date,
                "all_day": all_day,
                "color": color,
                "user_id": user_id
            }
            
            # Insert the event into the database
            response = self._client.table("events").insert(event_data).execute()
            
            if hasattr(response, 'error') and response.error:
                return {"error": str(response.error)}
                
            # Return the created event
            return response.data[0] if response.data else {"error": "Failed to create event"}
            
        except Exception as e:
            return {"error": str(e)}
    
    def fetch_events(self, user_id, start_date=None, end_date=None):
        """Fetches events for a specific user with optional date filtering."""
        try:
            query = self._client.table("events").select("*").eq("user_id", user_id)
            
            # Apply date filters if provided
            if start_date:
                query = query.gte("start_date", start_date)
            if end_date:
                query = query.lte("end_date", end_date)
                
            # Execute the query
            response = query.order("start_date").execute()
            
            if hasattr(response, 'error') and response.error:
                return {"error": str(response.error)}
                
            return response.data
            
        except Exception as e:
            return {"error": str(e)}
    
    def get_event(self, event_id, user_id):
        """Fetches a specific event by ID for a user."""
        try:
            response = self._client.table("events").select("*").eq("id", event_id).eq("user_id", user_id).execute()
            
            if hasattr(response, 'error') and response.error:
                return {"error": str(response.error)}
                
            if not response.data:
                return {"error": "Event not found"}
                
            return response.data[0]
            
        except Exception as e:
            return {"error": str(e)}
    
    def update_event(self, event_id, event_data, user_id):
        """Updates an existing event."""
        try:
            # Ensure the event exists and belongs to the user
            event = self.get_event(event_id, user_id)
            if "error" in event:
                return event
                
            # Update the event
            response = self._client.table("events").update(event_data).eq("id", event_id).eq("user_id", user_id).execute()
            
            if hasattr(response, 'error') and response.error:
                return {"error": str(response.error)}
                
            if not response.data:
                return {"error": "Failed to update event"}
                
            return response.data[0]
            
        except Exception as e:
            return {"error": str(e)}
    
    def delete_event(self, event_id, user_id):
        """Deletes an event."""
        try:
            # Ensure the event exists and belongs to the user
            event = self.get_event(event_id, user_id)
            if "error" in event:
                return event
                
            # Delete the event
            response = self._client.table("events").delete().eq("id", event_id).eq("user_id", user_id).execute()
            
            if hasattr(response, 'error') and response.error:
                return {"error": str(response.error)}
                
            return {"success": "Event deleted successfully"}
            
        except Exception as e:
            return {"error": str(e)}
            
    def delete_all_events(self, user_id):
        """Deletes all events for a user."""
        try:
            # Delete all events for the user
            response = self._client.table("events").delete().eq("user_id", user_id).execute()
            
            if hasattr(response, 'error') and response.error:
                return {"error": str(response.error)}
                
            return {"success": "All events deleted successfully"}
            
        except Exception as e:
            return {"error": str(e)}