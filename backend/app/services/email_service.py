import smtplib
import resend
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

EMAIL_SENDER = settings.EMAIL_SENDER
EMAIL_PASSWORD = settings.EMAIL_PASSWORD
FRONTEND_BASE_URL = settings.FRONTEND_BASE_URL or "http://localhost:5173"
RESEND_API_KEY = settings.RESEND_API_KEY

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

def send_via_resend(email: str, subject: str, html_content: str):
    try:
        # Resend requiere que el remitente sea un dominio verificado (ej. no-reply@tudominio.com)
        # Si usas el sandbox gratuito de Resend, solo puedes enviar a tu propio correo verificado.
        # Por defecto, Resend te da el correo 'onboarding@resend.dev' para pruebas.
        sender = EMAIL_SENDER if EMAIL_SENDER and '@gmail.com' not in EMAIL_SENDER else 'onboarding@resend.dev'
        
        r = resend.Emails.send({
            "from": sender,
            "to": email,
            "subject": subject,
            "html": html_content
        })
        print(f"Correo enviado exitosamente usando Resend a {email}: {r}", flush=True)
    except Exception as e:
        print(f"Error enviando email por Resend: {e}", flush=True)

def send_via_smtp(email: str, subject: str, html_content: str):
    msg = MIMEMultipart()
    msg['From'] = EMAIL_SENDER
    msg['To'] = email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() 
        server.login(EMAIL_SENDER, EMAIL_PASSWORD) 
        server.send_message(msg)
        server.quit()
        print(f"Correo enviado exitosamente usando Gmail SMTP a {email}", flush=True)
    except Exception as e:
        print(f"Error enviando email por Gmail SMTP: {e}", flush=True)

def send_registration_verification_email(email: str, token: str):
    verification_link = f"{FRONTEND_BASE_URL}/verify-email?token={token}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Verifica tu cuenta</h2>
        <p>Gracias por registrarte.</p>
        <p>Para activar tu cuenta y poder iniciar sesión, haz clic en el siguiente enlace:</p>
        <a href="{verification_link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verificar Correo</a>
    </div>
    """
    
    if RESEND_API_KEY:
        send_via_resend(email, "Verifica tu cuenta - MyLex", html_content)
    else:
        send_via_smtp(email, "Verifica tu cuenta - MyLex", html_content)

def send_password_reset_email(email: str, token: str):
    reset_link = f"{FRONTEND_BASE_URL}/reset-password?token={token}"
    html_content = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Recuperación de Contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="{reset_link}" style="display: inline-block; padding: 10px 20px; background-color: #00c3ff; color: white; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>Si no fuiste tú quien solicitó este cambio, puedes ignorar este correo.</p>
    </div>
    """
    
    if RESEND_API_KEY:
        send_via_resend(email, "Restablece tu contraseña - MyLex", html_content)
    else:
        send_via_smtp(email, "Restablece tu contraseña - MyLex", html_content)