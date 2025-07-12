import smtplib
from email.mime.text import MIMEText
import os

smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
smtp_port = int(os.getenv('SMTP_PORT', 587))
smtp_user = os.getenv('SMTP_USERNAME')
smtp_pass = os.getenv('SMTP_PASSWORD')
email_from = os.getenv('EMAIL_FROM', smtp_user)
email_to = smtp_user

msg = MIMEText('This is a test email from Skill Swap Platform SMTP test script.')
msg['Subject'] = 'SMTP Test'
msg['From'] = email_from
msg['To'] = email_to

try:
    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.sendmail(email_from, [email_to], msg.as_string())
    print('Email sent successfully!')
except Exception as e:
    print('Failed to send email:', e)
