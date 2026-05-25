"""Add privacy and language to vocabulary_lists

Revision ID: f4d4be4eff52
Revises: f3d3be3eff41
Create Date: 2026-05-25 10:18:02.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f4d4be4eff52'
down_revision = 'f3d3be3eff41'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('vocabulary_lists', sa.Column('privacy', sa.String(), nullable=False, server_default='public'))
    op.add_column('vocabulary_lists', sa.Column('language', sa.String(), nullable=False, server_default='English'))


def downgrade() -> None:
    op.drop_column('vocabulary_lists', 'language')
    op.drop_column('vocabulary_lists', 'privacy')
