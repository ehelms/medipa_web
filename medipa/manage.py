import os
import sys
import argparse
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../')
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../lib/')

from medipa.views import app
from medipa import test_runner


def start():
    args = parse_args()
    if args.action == 'runserver':
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
