from twilio.rest import Client
import json

def alarm(message):

<<<<<<< HEAD
    with open('./track/conf/sms_config.json') as json_data_file:
=======
    with open('C:/Users/siver/Desktop/Hackathon2019/akphackathon/senior_track/track/conf/sms_config.json') as json_data_file:
>>>>>>> a8c86dfc992123ad8e810e95e65f9c6d65d7328b
        data = json.load(json_data_file)

    account_sid = data['sms']['account_sid']
    auth_token = data['sms']['auth_token']

    client = Client(account_sid, auth_token)

    host_number = data['sms']['host_number']
    workers = data['sms']['workers']
    
    
    for worker in workers:
        client.messages.create(to=worker, 
                            from_=host_number, 
                            body=message)