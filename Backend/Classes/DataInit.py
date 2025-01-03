from supabase import create_client, Client
from dotenv import load_dotenv
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Load environment variables
load_dotenv()


# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# init the database
# Function to fetch tasks
def fetch_tasks():
    """Fetch all tasks from the Supabase database."""
    response = supabase.table('Tasks').select('*').execute()
    if response.error:
        raise Exception(response.error.message)
    return response.data



