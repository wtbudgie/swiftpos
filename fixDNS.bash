#!/bin/bash

# Check for root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Define DNS servers
DNS_SERVERS=("1.1.1.1" "1.0.0.1")

# Get list of all network services (excluding the header line)
SERVICES=$(networksetup -listallnetworkservices | tail -n +2)

# Loop through and set DNS for each
while IFS= read -r SERVICE; do
    # Skip disabled services
    if networksetup -getinfo "$SERVICE" | grep -q "IP address"; then
        networksetup -setdnsservers "$SERVICE" "${DNS_SERVERS[@]}"
        echo "DNS for '$SERVICE' set to: ${DNS_SERVERS[*]}"
    fi
done <<< "$SERVICES"
