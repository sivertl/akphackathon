from twilio.rest import Client
import json

def alarm(message):

    with open('./track/conf/sms_config.json') as json_data_file:
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