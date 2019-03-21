from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def home(request):
    return render(request, 'track/index.html')
def map(request):
    return render(request, 'map/map.html')
    