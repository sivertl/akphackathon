
import paho.mqtt.client as _mqtt
import ssl
import json
import math
import time
import traceback

import sys

class MQTT:
	__mqttclient = None
	__device_data = {}
	__message_count = 0
	__fallen_callback = None
	__fall_timeout = 30
	
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
			#sys.stdout.write('\r{:5}   '.format(MQTT.__message_count))
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
			traceback.print_exc()
			sys.exit(-1)
	
	# 
	def __process_message(msg):
		tagid = msg['tagId']
		if not tagid in MQTT.__device_data:
			MQTT.__device_data[tagid] = {}
			
		if msg['success'] == False:
			return
		
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
				# if first fall, set the time of the last time to zero ( way back in 1th of january 1970 :P )
				if not 'lastfall_time' in MQTT.__device_data[tagid]:
					MQTT.__device_data[tagid]['lastfall_time'] = 0
					
				# check that the previous fall was sufficiently long ago
				if time.time() - MQTT.__device_data[tagid]['lastfall_time'] > MQTT.__fall_timeout:
					# check if a fall callback function has been set, if so, run it
					if not MQTT.__fallen_callback is None:
						MQTT.__fallen_callback(tagid)
						
				# reset the fall timer to current time
				MQTT.__device_data[tagid]['lastfall_time'] = time.time()
	
	# Returns the latest coordinates as a dictionary of 'x', 'y' and 'z'
	# If device is not known, or if no xyz data has been found on the device, it returns None
	@staticmethod
	def get_coordinates(device_key):
		# if the device key is in the device data list, and that it has a previous xyz value stored
		if device_key in MQTT.__device_data and 'previous_xyz' in MQTT.__device_data[device_key]:
				return MQTT.__device_data[device_key]['previous_xyz']
		else:
			return None
	
	# Sets a callback function to be run when a fall is detected in a device
	# Function should have an argument that is the id of the falling device
	@staticmethod
	def set_fall_callback(callback_function):
		MQTT.__fallen_callback = callback_function
	
	@staticmethod
	def fell_recently(device_id):
		# if known device
		if device_id in MQTT.__device_data:
			# if device has had a recorded fall in the past
			if 'lastfall_time' in MQTT.__device_data[device_id]:
				# if fall was recently, then true
				return (time.time() - MQTT.__device_data[device_id]['lastfall_time']) < MQTT.__fall_timeout
			else:
				# never fallen => not currently falling
				return False
		else:
			# unknown device, unknown state
			return None

