IMAGE_NAME = "starname-manager"

build:
	DOCKER_BUILDKIT=1 docker build -t $(IMAGE_NAME) .

.PHONY: build # this is a phony target, meaning it is not a file name.