from django.urls import path
from .views import SignupView, LoginView, EmailVerifyView, ProfilePhotoUploadView, ProfilePhotoGetView, UserProfileView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-email/', EmailVerifyView.as_view(), name='verify-email'),
    path('profile-photo/', ProfilePhotoUploadView.as_view(), name='profile-photo-upload'),
    path('profile-photo/<uuid:user_id>/', ProfilePhotoGetView.as_view(), name='profile-photo-get'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
]
