
import paho.mqtt.client as _mqtt
import ssl
import json
import math

import sys

class MQTT:
	__mqttclient = None
	__device_data = {}
	__message_count = 0
	
	# Initializes the shared mqtt client if not done so already
	def __init__(self, host='mqtt.cloud.pozyxlabs.com', port=443, username='', password='', use_ssl = True, use_websocket = True, topics=[]):
	
		#if mqttclient isn't initialized
		if MQTT.__mqttclient == None:
		
			# create underlying mqtt client
			if use_websocket:
				MQTT.__mqttclient = _mqtt.Client(transport='websockets')
			else:
				MQTT.__mqttclient = _mqtt.Client()
			
			# if given a username and password, set the mqtt client to use them
			if username != '' or password != '':
				MQTT.__mqttclient.username_pw_set(username, password)
			
			# if ssl is enabled
			if use_ssl:
				# set the security context
				MQTT.__mqttclient.tls_set_context(context=ssl.create_default_context())
			
			# Sett the callback functions
			MQTT.__mqttclient.on_message = MQTT.__on_message
			
			# Try to connect to the host
			MQTT.__mqttclient.connect(host, port=port)
			
			# add subscriptions
			for t in topics:
				MQTT.__mqttclient.subscribe(t)
			# Start detached network loop
			MQTT.__mqttclient.loop_start()
	
	# Unbound function to act as message callback
	def __on_message(client, userdata, msg_b):
		try:
			sys.stdout.write('\r{}      '.format(MQTT.__message_count))
			MQTT.__message_count += 1
			# We parse the message payload and iterate over the array of... data? messages? whatever you want to call it
			message = json.loads(msg_b.payload.decode())
			if type(message) is list:
				for m in message:
					MQTT.__process_message(m)
			else:
				MQTT.__process_message(message)
		except Exception as e:
			print('__on_message error: ', e)
	
	# 
	def __process_message(msg):
		if msg['success'] == False:
			return
		tagid = msg['tagId']
		if not tagid in MQTT.__device_data:
			MQTT.__device_data[tagid] = {}
		
		MQTT.__device_data[tagid]['previous_xyz'] = msg['data']['coordinates']
		
		if 'accelerometer' in msg['data']['tagData']:
			acceleration_xyz = msg['data']['tagData']['accelerometer'][0]
			acceleration = 	math.sqrt(
												math.pow(acceleration_xyz[0], 2) + 
												math.pow(acceleration_xyz[1], 2) + 
												math.pow(acceleration_xyz[2], 2)
											)
			if acceleration > 2200:
				print('FALLING! - {}'.format(tagid))
	
	# Returns the latest coordinates as a dictionary of 'x', 'y' and 'z'
	def get_coordinates(device_key):
		if device_key in __previous_xyz:
			return __previous_xyz[device_key]
		else:
			raise KeyError('device key "{}" not found in coordinate dictionary'.format(device_key))
	

