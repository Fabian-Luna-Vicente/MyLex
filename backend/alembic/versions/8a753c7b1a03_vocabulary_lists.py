"""vocabulary_lists

Revision ID: 8a753c7b1a03
Revises: 6dbb8ccab3ec
Create Date: 2026-05-02 09:10:37.954451

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a753c7b1a03'
down_revision: Union[str, Sequence[str], None] = '6dbb8ccab3ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
