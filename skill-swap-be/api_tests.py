from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.core import mail
from user.models import User
from swap.models import Skill, Swap
import uuid

class APISpecTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.signup_data = {
            'email': 'alice@example.com',
            'password': 'Password123',
            'name': 'Alice',
            'location': 'NYC',
            'bio': 'I teach Spanish',
            'availability': [
                {'day': 'Monday', 'start': '18:00', 'end': '20:00'},
                {'day': 'Saturday', 'start': '10:00', 'end': '12:00'}
            ],
            'is_public': True
        }
        self.signup_url = reverse('signup')
        self.login_url = reverse('login')
        self.verify_url = reverse('verify-email')
        self.profile_photo_upload_url = reverse('profile-photo-upload')

    def test_signup_and_email_verification(self):
        response = self.client.post(self.signup_url, self.signup_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(len(mail.outbox) >= 1)
        otp = mail.outbox[0].body.split(': ')[-1].strip()
        verify_data = {'email': self.signup_data['email'], 'otp': otp}
        verify_response = self.client.post(self.verify_url, verify_data, format='json')
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertIn('Email verified successfully.', verify_response.data['message'])

    def test_login(self):
        self.client.post(self.signup_url, self.signup_data, format='json')
        otp = mail.outbox[-1].body.split(': ')[-1].strip()
        self.client.post(self.verify_url, {'email': self.signup_data['email'], 'otp': otp}, format='json')
        login_data = {'email': self.signup_data['email'], 'password': self.signup_data['password']}
        login_response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_response.data)
        self.assertIn('refresh', login_response.data)
        self.token = login_response.data['access']

    def test_profile_photo_upload_and_get(self):
        self.test_login()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        with open('test_image.jpg', 'wb') as f:
            f.write(b'\x89PNG\r\n\x1a\n')
        with open('test_image.jpg', 'rb') as img:
            response = self.client.post(self.profile_photo_upload_url, {'profile_photo': img}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        url = response.data['profile_photo_url']
        user = User.objects.get(email=self.signup_data['email'])
        get_url = reverse('profile-photo-get', args=[user.id])
        get_response = self.client.get(get_url)
        self.assertEqual(get_response.status_code, status.HTTP_200_OK)
        self.assertEqual(get_response.data['profile_photo_url'], url)

    def test_skill_crud(self):
        self.test_login()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        skill_data = {
            'name': 'Python',
            'description': 'I teach Python',
            'category': 'Programming',
            'level': 'Expert',
            'type': 'offer'
        }
        create_url = reverse('skill-list')
        response = self.client.post(create_url, skill_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        skill_id = response.data['id']
        update_url = reverse('skill-detail', args=[skill_id])
        update_response = self.client.put(update_url, {'description': 'Updated description'}, format='json')
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        delete_response = self.client.delete(update_url)
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_swap_flow(self):
        self.test_login()
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)
        # Create another user
        other_data = self.signup_data.copy()
        other_data['email'] = 'bob@example.com'
        self.client.post(self.signup_url, other_data, format='json')
        otp = mail.outbox[-1].body.split(': ')[-1].strip()
        self.client.post(self.verify_url, {'email': other_data['email'], 'otp': otp}, format='json')
        # Create skills
        skill_data = {
            'name': 'Python',
            'description': 'I teach Python',
            'category': 'Programming',
            'level': 'Expert',
            'type': 'offer'
        }
        skill_url = reverse('skill-list')
        skill_resp = self.client.post(skill_url, skill_data, format='json')
        skill_id = skill_resp.data['id']
        # Propose swap
        swap_data = {
            'requester_skill_id': skill_id,
            'receiver_id': str(User.objects.get(email=other_data['email']).id),
            'receiver_skill_id': skill_id,
            'proposed_time_slots': [{'day': 'Saturday', 'start': '10:00', 'end': '12:00'}]
        }
        swap_url = reverse('swap-list')
        swap_resp = self.client.post(swap_url, swap_data, format='json')
        self.assertEqual(swap_resp.status_code, status.HTTP_201_CREATED)
        swap_id = swap_resp.data['id']
        # Accept swap
        accept_url = reverse('swap-accept', args=[swap_id])
        accept_resp = self.client.put(accept_url)
        self.assertEqual(accept_resp.status_code, status.HTTP_200_OK)
        # Complete swap
        complete_url = reverse('swap-complete', args=[swap_id])
        complete_resp = self.client.put(complete_url)
        self.assertEqual(complete_resp.status_code, status.HTTP_200_OK)

    def test_admin_endpoints(self):
        # Create admin user
        admin_user = User.objects.create_superuser(email='admin@example.com', password='AdminPass123', name='Admin')
        self.client.force_authenticate(user=admin_user)
        users_url = reverse('admin-users')
        users_resp = self.client.get(users_url)
        self.assertEqual(users_resp.status_code, status.HTTP_200_OK)
        ban_url = reverse('admin-ban-user', args=[admin_user.id])
        ban_resp = self.client.put(ban_url, {'is_banned': True}, format='json')
        self.assertEqual(ban_resp.status_code, status.HTTP_200_OK)
        pending_skills_url = reverse('admin-pending-skills')
        pending_resp = self.client.get(pending_skills_url)
        self.assertEqual(pending_resp.status_code, status.HTTP_200_OK)
        # Approve/reject skill
        skill = Skill.objects.create(user=admin_user, name='Python', description='desc', category='Programming', level='Expert', type='offer')
        approve_url = reverse('admin-approve-skill', args=[skill.id])
        approve_resp = self.client.put(approve_url)
        self.assertEqual(approve_resp.status_code, status.HTTP_200_OK)
        reject_url = reverse('admin-reject-skill', args=[skill.id])
        reject_resp = self.client.put(reject_url, {'reason': 'Spam'}, format='json')
        self.assertEqual(reject_resp.status_code, status.HTTP_200_OK)
        # Broadcast
        broadcast_url = reverse('admin-broadcast-message')
        broadcast_resp = self.client.post(broadcast_url, {'message': 'Platform update!'}, format='json')
        self.assertEqual(broadcast_resp.status_code, status.HTTP_200_OK)
