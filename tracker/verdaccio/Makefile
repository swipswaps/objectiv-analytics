run:
	docker network create verdaccio
	docker run -d --rm -it --name verdaccio -v $(PWD)/config.yaml:/verdaccio/conf/config.yaml -p 127.0.0.1:4873:4873 --network verdaccio verdaccio/verdaccio:5

	docker exec -tiu0 verdaccio ash -c 'apk update && apk add tinyproxy && echo "Allow 172.0.0.0/8" >> /etc/tinyproxy/tinyproxy.conf && tinyproxy'

stop:
	docker stop verdaccio
	docker network rm verdaccio
