from Classes.DataConfig import DataConfig

class ProjectManager:
    def __init__(self):
        self._client = DataConfig.get_client()
        self._auth_token = None
        