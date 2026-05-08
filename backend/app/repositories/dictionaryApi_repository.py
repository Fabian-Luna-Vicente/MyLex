
import httpx

class DictionaryApiRepository:
    def __init__(self):
        self.base_url = "https://api.dictionaryapi.dev/api/v2/entries/en/"

    async def getDefinition(self, clean_word):
       async with httpx.AsyncClient() as client:
                    try:
                        resp = await client.get(f"{self.base_url}{clean_word}")
                        if resp.status_code == 200:
                            raw_data = resp.json()
                            formatted_data = []

                            for entry in raw_data:
                                all_meanings = []
                                all_examples = []
                                all_synonyms = set()
                                all_antonyms = set()
                                all_types = set()

                                for m in entry.get("meanings", []):
                                    part_of_speech = m.get("partOfSpeech", "").capitalize()
                                    if part_of_speech:
                                        all_types.add(part_of_speech)

                                    for i, d in enumerate(m.get("definitions", [])):
                                        definition_text = d.get("definition")
                                        formatted_def = f"{len(all_meanings) + 1}. ({part_of_speech}) {definition_text}"
                                        all_meanings.append(formatted_def)
                                        if "example" in d:
                                            all_examples.append(d["example"])

                                    all_synonyms.update(m.get("synonyms", []))
                                    all_antonyms.update(m.get("antonyms", []))

                                formatted_data.append({
                                    "name": entry.get("word"),
                                    "meaning": "\n".join(all_meanings), 
                                    "type": list(all_types),
                                    "examples": all_examples[:4],
                                    "synonyms": list(all_synonyms)[:6],
                                    "antonyms": list(all_antonyms)[:6],
                                    "image": "",
                                    "language": "en",
                                    "originalContext": "" 
                                })
                            return formatted_data
                        else:
                            return [{"error": True, "message": "Word not found in API"}]
                    except Exception as e:
                        return [{"error": True, "message": f"API Error: {str(e)}"}]