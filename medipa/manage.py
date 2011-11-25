import os
import sys
import argparse
import subprocess
import signal

BASE_DIR = os.path.dirname(os.path.abspath(__file__)) + '/../'

sys.path.append(BASE_DIR)
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../lib/')

os.environ['OPENSHIFT_DATA_DIR'] = BASE_DIR + "data"
os.environ['APPDIR'] = BASE_DIR

from medipa.views import app
from medipa import test_runner


def start():
    args = parse_args()

    if args.action == 'runserver':
        processname = 'celeryd'
        for line in os.popen("ps xa"):
            fields = line.split()
            pid = fields[0]
            stat = fields[2]
            process = fields[4]
            
            if stat == "Sl":
                
                try:
                    line.index(processname)
                    # Kill the Process. Change signal.SIGHUP to signal.SIGKILL if you like
                    os.kill(int(pid), signal.SIGKILL)
                    break
                except ValueError:
                    pass
        for line in os.popen("ps xa"):
            fields = line.split()
            pid = fields[0]
            stat = fields[2]
            process = fields[4]
        
            try:
                line.index(processname)
                # Kill the Process. Change signal.SIGHUP to signal.SIGKILL if you like
                os.kill(int(pid), signal.SIGKILL)
                break
            except ValueError:
                pass

        subprocess.Popen(["python", "celery_manager.py", "celeryd"], env=os.environ)

        if args.ip_address:
            app.run(host=args.ip_address, debug=args.debug)
        else:
            app.run(debug=args.debug)

    if args.action == 'test':
        test_runner.run()

def parse_args():
    parser = argparse.ArgumentParser()
    subparsers = parser.add_subparsers(dest='action')

    parser_runserver = subparsers.add_parser('runserver', help='Starts the development server')
    parser_runserver.add_argument('ip_address', metavar='IP', nargs='?',
                        help='IP address to serve from (default: 127.0.0.1:5000)')
    parser_runserver.add_argument('--nodebug', action='store_false', dest='debug', help='Whether to turn debug on or off (default: true)')

    parser_test = subparsers.add_parser('test', help='Runs the test suite')
    
    return parser.parse_args()

if __name__ == '__main__':
    start()
