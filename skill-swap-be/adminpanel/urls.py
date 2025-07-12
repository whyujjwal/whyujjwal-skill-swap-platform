from django.urls import path
from . import views

urlpatterns = [
    path('users/', views.UserListView.as_view(), name='admin-users'),
    path('users/<uuid:id>/ban/', views.UserBanView.as_view(), name='admin-ban-user'),
    path('skills/pending/', views.PendingSkillsView.as_view(), name='admin-pending-skills'),
    path('skills/<uuid:id>/approve/', views.ApproveSkillView.as_view(), name='admin-approve-skill'),
    path('skills/<uuid:id>/reject/', views.RejectSkillView.as_view(), name='admin-reject-skill'),
    path('messages/broadcast/', views.BroadcastMessageView.as_view(), name='admin-broadcast-message'),
]
