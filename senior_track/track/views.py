from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Create your views here.
def home(request):
    return render(request, 'track/index.html')

def check_alerts(request):
    return JsonResponse({"hey":"hey"})