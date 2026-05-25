class DomainException(Exception):
    """Base class for all domain exceptions."""
    pass

class ResourceNotFoundError(DomainException):
    def __init__(self, detail: str = "Resource not found"):
        self.detail = detail
        super().__init__(self.detail)

class PermissionDeniedError(DomainException):
    def __init__(self, detail: str = "Permission denied"):
        self.detail = detail
        super().__init__(self.detail)

class ValidationError(DomainException):
    def __init__(self, detail: str = "Validation error"):
        self.detail = detail
        super().__init__(self.detail)

class AuthenticationError(DomainException):
    def __init__(self, detail: str = "Authentication error"):
        self.detail = detail
        super().__init__(self.detail)

class ExternalServiceError(DomainException):
    def __init__(self, detail: str = "External service error"):
        self.detail = detail
        super().__init__(self.detail)
