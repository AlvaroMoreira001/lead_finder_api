import time
import requests
from config.settings import GOOGLE_API_KEY


class GooglePlacesService:

    def search_places(self, query, max_results=20):
        """
        A Google Places Text Search retorna até 20 resultados por página,
        com no máximo 3 páginas (60 resultados total) via next_page_token.

        Para requests acima de 20, fazemos paginação explícita aguardando
        o token ficar disponível com retry agressivo.
        """
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        place_ids = []
        next_page_token = None

        while len(place_ids) < max_results:
            # Monta params: primeira página usa query, demais usam pagetoken
            if next_page_token:
                params = {"pagetoken": next_page_token, "key": GOOGLE_API_KEY}
            else:
                params = {"query": query, "key": GOOGLE_API_KEY}

            # Retry até 6x para lidar com token ainda não pronto
            data = None
            for attempt in range(6):
                r = requests.get(url, params=params)
                data = r.json()
                status = data.get("status")

                if status == "INVALID_REQUEST" and next_page_token:
                    # Token ainda não está pronto, aguarda
                    time.sleep(2)
                    continue
                break

            if not data:
                break

            results = data.get("results", []) or []
            for p in results:
                if len(place_ids) >= max_results:
                    break
                pid = p.get("place_id")
                if pid and pid not in place_ids:
                    place_ids.append(pid)

            # Verifica se há próxima página
            next_page_token = data.get("next_page_token")

            if not next_page_token:
                break  # Sem mais páginas, para

            if len(place_ids) >= max_results:
                break

            # Aguarda token ficar válido (Google exige ~2s entre páginas)
            time.sleep(2)

        return place_ids

    def get_details(self, place_id):
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {
            "place_id": place_id,
            "fields": "name,formatted_phone_number,website,formatted_address,rating",
            "key": GOOGLE_API_KEY,
        }

        r = requests.get(url, params=params)
        data = r.json()
        result = data.get("result", {}) or {}

        return {
            "name": result.get("name"),
            "phone": result.get("formatted_phone_number"),
            "website": result.get("website"),
            "address": result.get("formatted_address"),
            "rating": result.get("rating"),
        }