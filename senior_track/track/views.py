from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
import json
from django.conf import settings

from .scripts import mqttapi
from .scripts import sms

<<<<<<< HEAD

_GRANNY_DATA = './track/conf/granny_data.json'
=======
_GRANNY_DATA = 'C:/Users/siver/Desktop/Hackathon2019/akphackathon/senior_track/track/conf/granny_data.json'
>>>>>>> a8c86dfc992123ad8e810e95e65f9c6d65d7328b

# Callback function to mqtt object
def test(device_id):
    with open(_GRANNY_DATA) as json_obj:
        data = json.load(json_obj)

        if device_id in data['id']:
            sms.alarm((data['id'][device_id] + ' had a bad fall'))
            print(data['id'][device_id], ' had a bad fall')

# Creates an mqtt object and setts a callback function
m = mqttapi.MQTT(host='10.101.115.207', port=1883, topics=['tagsLive'], use_ssl = False, use_websocket = False)
m.set_fall_callback(test)

# Create your views here.
def home(request):
    return render(request, 'track/index.html')

def update(request):
    with open(_GRANNY_DATA) as json_obj:
        data = json.load(json_obj)
        
        # Getts granny update
        granny_update = []
        for granny_id in data['id']:
            granny_update.append({data['id'][granny_id]:{
                    'coord':m.get_coordinates(granny_id),
                    'status':m.fell_recently(granny_id)
                }})
                

        # Check if granny out of range
        if granny_update[2]['Reidar']['coord']['y'] < 474 and not settings.RAN:
            print(granny_update)
            settings.RAN = True
            sms.alarm('Reidar ran away ')
            

    return JsonResponse(granny_update, safe=False)
    
def map(request):
    return render(request, 'map/map.html')
    
