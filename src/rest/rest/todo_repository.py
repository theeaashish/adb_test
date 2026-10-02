from __future__ import annotations


class TodoRepository:
    """todo repository is responsible for persisting todo items to the database"""

    def __init__(self, database):
        self.collection = database["todos"]

    def create(self, description: str) -> dict[str, str]:
        """create a new todo item in the db and return the created item"""

        result = self.collection.insert_one({"description": description})

        return {"id": str(result.inserted_id), "description": description}

    def find_all(self) -> list[dict[str, str]]:
        """return all todo item from the db"""

        todos = self.collection.find()

        return [
            {"id": str(todo["_id"]), "description": todo["description"]}
            for todo in todos
        ]
