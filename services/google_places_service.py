import time

import requests
from config.settings import GOOGLE_API_KEY


class GooglePlacesService:

    def search_places(self, query, max_results=20):

        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"

        params = {
            "query": query,
            "key": GOOGLE_API_KEY,
        }

        place_ids = []

        while True:

            r = requests.get(url, params=params)

            data = r.json()

            results = data.get("results", []) or []

            for p in results:

                if len(place_ids) >= max_results:
                    break

                place_ids.append(p.get("place_id"))

            if len(place_ids) >= max_results:
                break

            next_page_token = data.get("next_page_token")

            if not next_page_token:
                break

            # A API do Google pode demorar alguns segundos
            # para liberar o next_page_token.
            time.sleep(2)

            params = {
                "pagetoken": next_page_token,
                "key": GOOGLE_API_KEY,
            }

        return place_ids


    def get_details(self, place_id):

        url = "https://maps.googleapis.com/maps/api/place/details/json"

        params = {
            "place_id": place_id,
            "fields": "name,formatted_phone_number,website,formatted_address,rating",
            "key": GOOGLE_API_KEY
        }

        r = requests.get(url, params=params)

        data = r.json()

        # Em alguns casos (erro de cota, place_id inválido, etc.) não existe a chave "result"
        result = data.get("result", {}) or {}

        return {
            "name": result.get("name"),
            "phone": result.get("formatted_phone_number"),
            "website": result.get("website"),
            "address": result.get("formatted_address"),
            "rating": result.get("rating"),
        }
