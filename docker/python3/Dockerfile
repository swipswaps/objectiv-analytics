FROM ubuntu:20.04

ARG TAG
ENV DEBIAN_FRONTEND=noninteractive

RUN \
	apt -y -q update && \
	apt -q -y install python3.8 virtualenv curl && \
	apt -y autoremove && \
	apt clean && \
	rm -rf /var/lib/apt/lists/* && \
	mkdir -p /services && \
	virtualenv -p python3 /services/venv

WORKDIR /services