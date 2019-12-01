import sys
import time

print(" ".join(sys.argv))

for i in range(12000):
    time.sleep(.1)
    print('Hello from Python!' + str(i))
    sys.stdout.flush()

print('lol')
sys.stdout.flush()