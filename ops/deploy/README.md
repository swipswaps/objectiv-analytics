# Deploying using docker-compose 
This provides some docker-compose files to be able to deploy part of the current stack on a production-like environment. Out-of-the-box it provides an nginx server in front of both ROD and the Collector, furthermore, ssl support in the form of letsencrypt is also baked in.

## Architecture 

Basically this setup consists of 2 parts (hence the 2 docker-compose files):
* proxy /https / letsencrypt -> docker-compose-proxy.yaml
* rod + collector + worker + pg -> docker-compose-stack.yaml

Docker provides a mechanism for combining multiple docker-compose files into one: simply specify them in the right order from the commandline; like so:

``` docker-compose -f docker-compose-proxy.yaml -f docker-compose-stack.yaml <command>```

To try and keep it generic-ish, some variables (domain names, ports) are set in .env, which is automagically read by docker-compose at runtime. For ROD we use a production build, to make it smaller and get rid of debug / dev output. Unfortunately, this means that configuration is baked into the build. This means, that configuration, like the URL for the collector needs to be set at build time.

The docker-compose files don't build anything, they simply refer to container images somewhere. The generic ones are on dockerhub. Our own images are in an image repository in GCP. You need to be logged in, in order to be able to pull them. More info on that here: https://cloud.google.com/container-registry/docs/advanced-authentication#gcloud-helper

## Requirements
To make this work, the environment you want to deploy on needs the following:
- Linux env, with working docker setup
- connected to the Internet (duh)
- be able to receive incoming connections on port 80 and 443
- have the FQDN's you want to use be resolvable to the external IP

## Deployment 
First, images need to be built and pushed. Fortunately, this is quite easy:

```
make -j2 build-all-images && make push-images
```

notice the push command, which will take care of tagging and pushing the images to GCP 

Now you can deploy the environment on the server:
```
# you need to have the ops/deploy dir (and its contents) on the server
# now simply run:
docker-compose -f docker-compose-proxy.yaml -f docker-compose-stack.yaml up
```

If you want to use different hostnames, tweak the .env file before deploying. If you change the hostname of the collector, be sure to rebuild the rod-prod image with the correct hostname as well.

## Authentication 
If you need authentication, create a dir called `htpasswd` with an htaccess file containing credentials. The file should have the same name as the host you want to secure. (Obviously do this before deploying)
