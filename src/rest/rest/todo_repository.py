from __future__ import annotations


class TodoRepository:
    """todo repository is responsible for persisting todo items to the database"""

    def __init__(self, database):
        self.collection = database["todos"]

    def create(self, description: str) -> dict[str, str]:
        """create a new todo item in the db and return the created item"""

        result = self.collection.insert_one({"description": description})

        return {"id": str(result.inserted_id), "description": description}
