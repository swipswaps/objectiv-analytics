
build-tracker:
	# clean up caches
	find core plugins trackers -type d -name dist -not -path '*node_modules*'  | xargs rm -rf
	yarn install && yarn build

publish-tracker: build-tracker
	cd verdaccio && make  run
	yarn publish