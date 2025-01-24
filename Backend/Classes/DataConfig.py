from supabase import create_client, Client
from dotenv import load_dotenv
import os

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
