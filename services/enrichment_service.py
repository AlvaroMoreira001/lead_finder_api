import requests
from utils.regex_utils import find_email, find_instagram


class EnrichmentService:

    def enrich(self, website):

        data = {
            "email": None,
            "instagram": None
        }

        if not website:
            return data

        try:

            r = requests.get(website, timeout=5)

            html = r.text

            data["email"] = find_email(html)

            data["instagram"] = find_instagram(html)

        except:
            pass

        return data
