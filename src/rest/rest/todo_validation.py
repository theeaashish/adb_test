from __future__ import annotations

from typing import Any

MAX_DESCRIPTION_LENGTH = 500


class TodoValidationError(ValueError):
    "Raised when a todo payload fails validation"

    def validate_create_todo_payload(payload: Any) -> dict[str, str]:
        if not isinstance(payload, dict):
            raise TodoValidationError("request body must be a json object")

        if "description" not in payload:
            raise TodoValidationError("description field is required")

        description = payload["description"]

        if not isinstance(description, str):
            raise TodoValidationError("description must be a string")

        description = description.strip()

        if not description:
            raise TodoValidationError("description cannot be empty")

        if len(description) > MAX_DESCRIPTION_LENGTH:
            raise TodoValidationError(
                f"description cannot exceed {MAX_DESCRIPTION_LENGTH} characters"
            )

        return {"description": description}
