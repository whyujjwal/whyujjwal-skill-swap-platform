# API test cases for signup, email verification, and login
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.core import mail

class UserAPITests(APITestCase):
    def test_signup_and_email_verification(self):
        url = reverse('signup')
        data = {
            'email': 'testuser@example.com',
            'password': 'TestPass123',
            'name': 'Test User',
            'location': 'Test City',
            'bio': 'I can teach Python',
            'availability': ['weekends'],
            'is_public': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # OTP should be sent
        self.assertTrue(len(mail.outbox) >= 1)
        otp = mail.outbox[0].body.split(': ')[-1].strip()
        verify_url = reverse('verify-email')
        verify_data = {'email': 'testuser@example.com', 'otp': otp}
        verify_response = self.client.post(verify_url, verify_data, format='json')
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn('Email verified successfully.', verify_response.data['message'])

    def test_login(self):
        # Create and verify user
        signup_url = reverse('signup')
        data = {
            'email': 'loginuser@example.com',
            'password': 'LoginPass123',
            'name': 'Login User',
            'location': 'Login City',
            'bio': 'I can teach Django',
            'availability': ['evenings'],
            'is_public': True
        }
        self.client.post(signup_url, data, format='json')
        otp = mail.outbox[-1].body.split(': ')[-1].strip()
        verify_url = reverse('verify-email')
        verify_data = {'email': 'loginuser@example.com', 'otp': otp}
        self.client.post(verify_url, verify_data, format='json')
        # Login
        login_url = reverse('login')
        login_data = {'email': 'loginuser@example.com', 'password': 'LoginPass123'}
        login_response = self.client.post(login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)
from django.test import TestCase

# Create your tests here.
