from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSignupSerializer, UserLoginSerializer, EmailVerificationSerializer
from .utils import send_otp_email, send_welcome_email, generate_otp, upload_to_s3
from django.utils import timezone
import datetime
import uuid
from rest_framework_simplejwt.tokens import RefreshToken

class ProfilePhotoUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        file = request.FILES.get('profile_photo')
        if not file:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)
        filename = f'profile_photos/{user.id}_{file.name}'
        from .utils import upload_to_s3
        url = upload_to_s3(file, filename)
        user.profile_photo = url
        user.save()
        return Response({'profile_photo_url': url})

class ProfilePhotoGetView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        from .models import User
        import boto3
        from django.conf import settings
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not user.profile_photo:
            return Response({'error': 'No profile photo.'}, status=status.HTTP_404_NOT_FOUND)
        # Extract S3 key from URL
        s3_key = user.profile_photo.split(f"/{settings.AWS_STORAGE_BUCKET_NAME}/")[-1]
        s3 = boto3.client('s3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME)
        presigned_url = s3.generate_presigned_url('get_object',
            Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': s3_key},
            ExpiresIn=3600)
        return Response({'profile_photo_url': presigned_url})


class SignupView(generics.CreateAPIView):
    serializer_class = UserSignupSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        otp = generate_otp()
        user.verification_token = otp
        user.verification_token_expires = timezone.now() + datetime.timedelta(minutes=10)
        user.save()
        print(f"Generated OTP: {otp} for user: {user.email}")
        # print(settings.)
        send_otp_email(user.email, otp)
        send_welcome_email(user.email, user.name)

        return user

class LoginView(generics.GenericAPIView):
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(email=serializer.validated_data['email'], password=serializer.validated_data['password'])
        if user is not None:
            if not user.email_verified:
                return Response({'error': 'Email not verified.'}, status=status.HTTP_403_FORBIDDEN)
            refresh = RefreshToken.for_user(user)
            return Response({'refresh': str(refresh), 'access': str(refresh.access_token)})
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

class EmailVerifyView(generics.GenericAPIView):
    serializer_class = EmailVerificationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = User.objects.get(email=serializer.validated_data['email'])
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user.verification_token == serializer.validated_data['otp'] and user.verification_token_expires > timezone.now():
            user.email_verified = True
            user.verification_token = None
            user.verification_token_expires = None
            user.save()
            return Response({'message': 'Email verified successfully.'})
        return Response({'error': 'Invalid or expired OTP.'}, status=status.HTTP_400_BAD_REQUEST)
from django.shortcuts import render

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if not user or not user.is_authenticated:
            return Response({'error': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = {
            'id': str(user.id),
            'email': user.email,
            'name': user.name,
            'location': user.location,
            'bio': user.bio,
            'availability': user.availability,
            'is_public': user.is_public,
            'skills': list(user.skills.values()),
            'ratings': list(user.received_ratings.values()),
        }
        # Generate presigned URL for profile photo
        if user.profile_photo:
            import boto3
            from django.conf import settings
            s3_key = user.profile_photo.split(f"/{settings.AWS_STORAGE_BUCKET_NAME}/")[-1]
            s3 = boto3.client('s3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME)
            presigned_url = s3.generate_presigned_url('get_object',
                Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': s3_key},
                ExpiresIn=3600)
            profile['profile_photo_url'] = presigned_url
        else:
            profile['profile_photo_url'] = None
        return Response(profile)
    serializer_class = UserSignupSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        otp = generate_otp()
        user.verification_token = otp
        user.verification_token_expires = timezone.now() + datetime.timedelta(minutes=10)
        user.save()
        print(f"Generated OTP: {otp} for user: {user.email}")
        # print(settings.)
        send_otp_email(user.email, otp)
        send_welcome_email(user.email, user.name)

        return user