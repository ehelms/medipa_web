#!/bin/bash

rm -rf medipa-env
virtualenv --no-site-packages --distribute medipa-env
for line in $(cat requirements.txt)
do
  pip install $line -E medipa-env
done
