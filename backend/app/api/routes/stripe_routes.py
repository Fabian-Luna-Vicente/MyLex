import stripe
from fastapi import APIRouter, Depends, Request, HTTPException, status
from sqlalchemy.orm import Session
import os

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.core.config import settings

router = APIRouter()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

# Precios cargados desde .env
PRICES = {
    "pro": {
        "monthly": os.getenv("STRIPE_PRICE_PRO_MONTHLY"),
        "yearly": os.getenv("STRIPE_PRICE_PRO_YEARLY")
    },
    "premium": {
        "monthly": os.getenv("STRIPE_PRICE_PREMIUM_MONTHLY"),
        "yearly": os.getenv("STRIPE_PRICE_PREMIUM_YEARLY")
    }
}

@router.post("/create-checkout-session")
def create_checkout_session(
    request: Request,
    data: dict,
    current_user: User = Depends(get_current_user)
):
    plan_tier = data.get("tier")
    billing_cycle = data.get("billingCycle")

    if plan_tier not in PRICES or billing_cycle not in PRICES[plan_tier]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Plan o ciclo de facturación inválido.")

    price_id = PRICES[plan_tier][billing_cycle]

    if not price_id:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="ID de precio no configurado en el servidor.")

    frontend_url = settings.FRONTEND_BASE_URL or "http://localhost:5173"

    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url=f"{frontend_url}/premium?success=true",
            cancel_url=f"{frontend_url}/premium?canceled=true",
            client_reference_id=current_user.id,
            customer_email=current_user.email,
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    # Handle the checkout.session.completed event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        user_id = session.get('client_reference_id')
        if user_id:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                # Aquí podrías determinar si es pro o premium según el price_id
                # Por simplicidad, extraemos el price_id y verificamos:
                line_items = stripe.checkout.Session.list_line_items(session.id)
                if line_items and line_items.data:
                    price_id = line_items.data[0].price.id
                    
                    if price_id in [PRICES["pro"]["monthly"], PRICES["pro"]["yearly"]]:
                        user.subscription_tier = "pro"
                    elif price_id in [PRICES["premium"]["monthly"], PRICES["premium"]["yearly"]]:
                        user.subscription_tier = "premium"
                        
                    db.commit()

    return {"status": "success"}
