from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

from .scripts import mqttapi

# Callback function to mqtt object
def test(device_id):
    print(device_id)

# Creates an mqtt object and setts a callback function
m = mqttapi.MQTT(host='10.101.115.207', port=1883, topics=['tagsLive'], use_ssl = False, use_websocket = False)
m.set_fall_callback(test)

# Create your views here.
def home(request):
    return render(request, 'track/index.html')

def check_alerts(request):
    return JsonResponse({"hey":"hey"})
    
def map(request):
    return render(request, 'map/map.html')
    
