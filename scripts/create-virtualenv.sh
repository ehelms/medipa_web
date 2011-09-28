#!/bin/bash

rm -rf mediscan-env
virtualenv --no-site-packages --distribute mediscan-env
for line in $(cat requirements.txt)
do
  pip install $line -E mediscan-env
done
