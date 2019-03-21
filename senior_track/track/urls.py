from django.urls import path

from . import views

app_name = 'track'

urlpatterns = [
    path('', views.home, name='home'),
    path('check_alerts/', views.check_alerts, name='check_alerts')
]
