# Use Webtop with Ubuntu and XFCE as base image
FROM lscr.io/linuxserver/webtop:ubuntu-xfce

# Set environment variable for X11 display
ENV DISPLAY=:1

# Install required packages including supervisor
RUN apt-get update && \
    apt-get install -y nodejs npm xdotool scrot imagemagick supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install LibreOffice if not already included
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create directory for the hypervisor
RUN mkdir -p /hypervisor

# Copy package files
COPY package*.json /hypervisor/

# Set working directory and install dependencies
WORKDIR /hypervisor
RUN npm install

# Copy application files
COPY src/ /hypervisor/src/
COPY tsconfig*.json /hypervisor/

# Build the application
RUN npm run build

# Create supervisord configuration directory
RUN mkdir -p /etc/supervisor/conf.d/

# Copy supervisord configuration
COPY supervisord-webtop.conf /etc/supervisor/conf.d/supervisord.conf

# Expose ports
# - 3100: NestJS API (changed from 3000 to avoid conflicts)
# - 3001: Webtop UI (already exposed by base image)
EXPOSE 3100

# The linuxserver/webtop container uses s6-overlay for initialization
# We'll create a custom init script to start our services
RUN mkdir -p /custom-services.d

COPY start-services.sh /custom-services.d/start-services.sh
RUN chmod +x /custom-services.d/start-services.sh

# The container will start using the default s6-overlay entrypoint
