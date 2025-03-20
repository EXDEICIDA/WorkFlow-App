from supabase import create_client, Client
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables
load_dotenv()

class DataConfig:
    """Centralized class for Supabase client configuration."""

    _client: Client = None  # Shared client instance

    @classmethod
    def get_client(cls) -> Client:
        """Initialize or retrieve the Supabase client."""
        if cls._client is None:
            url = os.getenv("SUPABASE_URL")
            key = os.getenv("SUPABASE_KEY")
            
            if not url or not key:
                raise Exception("Supabase configuration missing")
            
            cls._client = create_client(url, key)
        
        return cls._client
        
    @classmethod
    def get_auth_client(cls, auth_token=None) -> Client:
        """Get a client with auth token for RLS policies."""
        client = cls.get_client()
        
        if auth_token:
            # Set the auth header for RLS policies
            client.postgrest.auth(auth_token)
            
        return client
        
    @classmethod
    def get_timestamp(cls):
        """Get current timestamp in ISO format."""
        return datetime.utcnow().isoformat()
