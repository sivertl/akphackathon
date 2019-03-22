from tkinter import *
from mqttapi import MQTT
import math
import time
import os
from playsound import playsound as ps
from multiprocessing import Pool

devid = "3449185141"

root = Tk()
canvas = Canvas(root, width=500, height=500)
canvas.pack()
root.canvas = canvas.canvas = canvas
canvas.data = { }
bounds = None

monster = None
pool = Pool(processes=2)              # Start a worker processes.

mqt = MQTT(host='10.101.115.207', port=1883, topics=['tagsLive'], use_ssl=False, use_websocket=False)
sound_time = 0

def playsound(st):
	global pool
	pool.apply_async(ps, [st]) # Evaluate "f(10)" asynchronously calling callback when finished.

def cconv(coord):
	global bounds
	return [ ((coord[0] - bounds[0]) / (bounds[2] - bounds[0])) * 500, ((coord[1] - bounds[1]) / (bounds[3] - bounds[1])) * 500 ]

while True:
	c = mqt.get_coordinates(devid)
	
	if not c is None:
		canvas.delete(ALL)
		# update bounds
		if bounds is None:
			bounds = [c['x']-2000, c['y']-2000, c['x']+2000, c['y']+2000]
		if c['x'] < bounds[0]+10:
			bounds[0] = c['x']-10
		if c['y'] < bounds[1]+10:
			bounds[1] = c['y']-10
		if c['x'] > bounds[2]-10:
			bounds[2] = c['x']+10
		if c['y'] > bounds[3]-10:
			bounds[3] = c['y']+10
		
		# create monster if not already exists
		if monster is None:
			monster = [ c['x'] - 2000, c['y'] - 2000]
		# move monster towards player
		v = [ (c['x'] - monster[0]), (c['y'] - monster[1]) ]
		vlen = math.sqrt(math.pow(v[0], 2) + math.pow(v[1], 2))
		if vlen == 0:
			v = [0,0]
		v = [v[0]/vlen, v[1]/vlen]
		monster[0] = monster[0] + v[0] * 500/24
		monster[1] = monster[1] + v[1] * 500/24
		if vlen < 500:
			time.sleep(1)
			playsound('youlose.mp3')
			time.sleep(5)
			monster = [ c['x'] - 3000, c['y'] - 3000]
		else:
			if time.time() - sound_time > 0.6:
				if vlen < 1000:
					playsound('woop.mp3')
					sound_time = time.time()
				else:
					if vlen < 2000:
						playsound('beep.mp3')
						sound_time = time.time()
		
		wx = c['x']
		wy = c['y']
		gx = ((wx - bounds[0]) / (bounds[2] - bounds[0])) * 500
		gy = ((wy - bounds[1]) / (bounds[3] - bounds[1])) * 500
		
		gmonster = cconv(monster)
		
		canvas.create_rectangle(gx-10, gy-10, gx+10, gy+10, fill="green")
		canvas.create_rectangle(gmonster[0]-10, gmonster[1]-10, gmonster[0]+10, gmonster[1]+10, fill="red")
		root.update()
		time.sleep(0.04)

