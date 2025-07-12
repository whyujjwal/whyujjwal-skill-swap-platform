from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SwapListCreateView, SwapAcceptView, SwapRejectView, SwapCompleteView, SkillViewSet, RatingViewSet
)



router = DefaultRouter()
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'ratings', RatingViewSet, basename='rating')

urlpatterns = [
    path('swaps/', SwapListCreateView.as_view(), name='swap-list'),
    path('swaps/<uuid:pk>/accept/', SwapAcceptView.as_view(), name='swap-accept'),
    path('swaps/<uuid:pk>/reject/', SwapRejectView.as_view(), name='swap-reject'),
    path('swaps/<uuid:pk>/complete/', SwapCompleteView.as_view(), name='swap-complete'),
]
urlpatterns += router.urls
