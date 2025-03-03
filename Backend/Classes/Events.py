from Classes.DataConfig import DataConfig

class EventManager:
     def __init__(self):
        self._client = DataConfig.get_client()
        