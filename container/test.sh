#!/usr/bin/env bash
whoami

sudo -i -u pranjal bash << EOF
echo "In"
whoami
EOF
echo "Out"

whoami
