sudo yum update -y

sudo amazon-linux-extras install docker -y

sudo yum install git -y

sudo systemctl start docker
sudo systemctl enable docker

sudo usermod -aG docker ec2-user

DOCKER_COMPOSE_VERSION="1.29.2"
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" \
 -o /usr/local/bin/docker-compose
sudo chmod 666 /var/run/docker.sock
