import logging
import os

from pymongo import MongoClient
from pymongo.errors import PyMongoError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .todo_repository import TodoRepository
from .todo_validation import TodoValidationError, validate_create_todo_payload

logger = logging.getLogger(__name__)

mongo_uri = "mongodb://" + os.environ["MONGO_HOST"] + ":" + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)["test_db"]

todo_repository = TodoRepository(db)


class TodoListView(APIView):
    def get(self, request):
        # Implement this method - return all todo items from db instance above.
        return Response({}, status=status.HTTP_200_OK)

    def post(self, request):
        # Implement this method - accept a todo item in a mongo collection, persist it using db instance above.
        todo_data = request.data

        try:
            # validate the incoming todo payload
            todo = validate_create_todo_payload(todo_data)

        # if payload invalid return 400
        except TodoValidationError as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            created_todo = todo_repository.create(todo["description"])

        # if db error return 500
        except PyMongoError:
            logger.exception("failed to create todo item")

            return Response(
                {"error": "failed to create todo item"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(created_todo, status=status.HTTP_201_CREATED)
