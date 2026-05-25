import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")

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
    
    msg = MIMEMultipart()
    msg['From'] = EMAIL_SENDER
    msg['To'] = email
    msg['Subject'] = "Verifica tu cuenta"
    
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() 
        server.login(EMAIL_SENDER, EMAIL_PASSWORD) 
        server.send_message(msg)
        server.quit()
        print(f"Correo de verificación enviado exitosamente a {email}")
        
    except Exception as e:
        print(f"Error enviando email de verificación por Gmail: {e}")

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
    
    msg = MIMEMultipart()
    msg['From'] = EMAIL_SENDER
    msg['To'] = email
    msg['Subject'] = "Restablece tu contraseña - MyLex"
    
    msg.attach(MIMEText(html_content, 'html'))
    
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls() 
        server.login(EMAIL_SENDER, EMAIL_PASSWORD) 
        server.send_message(msg)
        server.quit()
        print(f"Correo de recuperación enviado exitosamente a {email}")
        
    except Exception as e:
        print(f"Error enviando email de recuperación: {e}")