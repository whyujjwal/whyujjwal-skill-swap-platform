import boto3
from django.conf import settings
from django.core.mail import send_mail
import random
import string

def upload_to_s3(file, filename):
    s3 = boto3.client('s3',
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_S3_REGION_NAME)
    s3.upload_fileobj(file, settings.AWS_STORAGE_BUCKET_NAME, filename)
    url = f'https://{settings.AWS_S3_CUSTOM_DOMAIN}/{filename}'
    return url

def send_otp_email(email, otp):
    subject = 'Skill Swap Platform - Email Verification OTP'
    message = f'Your OTP for email verification is: {otp}'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

def send_welcome_email(email, name):
    subject = 'Welcome to Skill Swap Platform!'
    message = f'Hi {name},\n\nWelcome to Skill Swap Platform! Start swapping your skills today.'
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])

def generate_otp():
    return ''.join(random.choices(string.digits, k=6))
