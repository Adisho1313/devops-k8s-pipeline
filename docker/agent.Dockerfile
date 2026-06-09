FROM node:20-bullseye

USER root

ENV DEBIAN_FRONTEND=noninteractive

# =========================
# Install system tools
# =========================
RUN apt-get update && apt-get install -y \
    git \
    curl \
    ca-certificates \
    gnupg \
    lsb-release \
    apt-transport-https \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# =========================
# Install kubectl
# =========================
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# =========================
# Verify tools (debug safety)
# =========================
RUN node -v && npm -v && git --version && docker --version && kubectl version --client

WORKDIR /workspace