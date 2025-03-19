#!/bin/bash

# Start our NestJS API server
cd /hypervisor && node dist/main.js &

# Log successful startup
echo "MindRoot Computer Use API server started on port 3100"

# Exit with success
exit 0
