
import paho.mqtt.client as _mqtt
import ssl
import json
import math

import sys

class MQTT:
	__mqttclient = None
	__device_data = {}
	__message_count = 0
	__fallen_callback = None
	
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
			sys.stdout.write('\r{:5}   '.format(MQTT.__message_count))
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
			# If the device is experiencing high or low acceleration (1000 is normal acceleration due to gravity)
			if acceleration > 2000 or acceleration < 150:
				# check if a fall callback function has been set
				if not type(MQTT.__fallen_callback) != type(None):
					MQTT.__fallen_callback(tagid)
	
	# Returns the latest coordinates as a dictionary of 'x', 'y' and 'z'
	# If device is not known, or if no xyz data has been found on the device, it returns None
	def get_coordinates(device_key):
		# if the device key is in the device data list, and that it has a previous xyz value stored
		if device_key in MQTT.__device_data and 'previous_xyz' in MQTT.__device_data[device_key]:
				return MQTT.__device_data[device_key]['previous_xyz']
		else:
			return None
	
	# Sets a callback function to be run when a fall is detected in a device
	# Function should have an argument that is the id of the falling device
	def set_fall_callback(callback_function):
		MQTT.__fallen_callback = callback_function

