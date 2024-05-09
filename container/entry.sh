#!/bin/sh
~/.local/bin/aws s3 cp s3://codedamn-playground/$PG_ID/ /home/slave/app/ --recursive
cd /opt/driver

rm -rf ~/.local/aws-cli
rm ~/.local/bin/aws
rm ~/.local/bin/aws_completer
rm -rf ~/.aws ~/aws ~/awscliv2.zip

node dist/index.mjs