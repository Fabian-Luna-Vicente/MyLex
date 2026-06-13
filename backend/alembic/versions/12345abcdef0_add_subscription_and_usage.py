"""Add subscription_tier and UserUsage

Revision ID: 12345abcdef0
Revises: f4d4be4eff52
Create Date: 2026-06-13 13:46:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '12345abcdef0'
down_revision = '48f4529e7a5f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add subscription_tier to users
    op.add_column('users', sa.Column('subscription_tier', sa.String(), server_default='free', nullable=False))

    # Create user_usages table
    op.create_table('user_usages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('daily_date', sa.Date(), nullable=False),
        sa.Column('weekly_date', sa.Date(), nullable=False),
        sa.Column('daily_dict_words', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_grammar_analysis', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_writing_corrections', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_chat_messages', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_chat_grammar_corrections', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_icebreakers', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_fluid_corrections', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_ai_pronunciation', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('daily_direct_mode_messages', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('weekly_dict_context_words', sa.Integer(), nullable=True, server_default='0'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_usages_id'), 'user_usages', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_usages_id'), table_name='user_usages')
    op.drop_table('user_usages')
    op.drop_column('users', 'subscription_tier')
