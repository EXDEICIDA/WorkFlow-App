from Classes.DataConfig import DataConfig

class Upload:
    def __init__(self):
        self._client = DataConfig.get_client()

    # Upload a file to the database or creta an bucket idc this fiel contains methods only for it
    