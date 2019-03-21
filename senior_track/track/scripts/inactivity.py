def check_inactivity(time_limit, timestamp, x, y):
    if last_x == x and last_y == y:
        last_timestamp = last_timestamp
    else:
        last_timestamp = timestamp
        last_x = x
        last_y = y

    if (timestamp - last_timestamp) > time_limit:
        alarm()


