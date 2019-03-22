from django.urls import path

from . import views


app_name = 'base'

urlpatterns = [
    path('', views.home, name='home'),
    path('update/', views.update, name='update'),
    path('map/', views.map, name = 'map')
]
