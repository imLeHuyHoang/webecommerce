#!/bin/bash

sudo yum update -y


sudo amazon-linux-extras install docker -y


sudo service docker start
sudo systemctl enable docker


sudo usermod -aG docker ec2-user


sudo chmod 666 /var/run/docker.sock


sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
 -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose


