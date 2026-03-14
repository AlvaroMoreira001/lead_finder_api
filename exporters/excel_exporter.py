import pandas as pd
from pathlib import Path


class ExcelExporter:

    def export(self, leads, query):

        df = pd.DataFrame(leads)

        filename = query.replace(" ", "_") + ".xlsx"

        path = Path("data") / filename

        df.to_excel(path, index=False)

        return path
