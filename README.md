# Files Manager

## Description

This project is a comprehensive back-end application designed to illustrate the assembly of various technologies and concepts including authentication, NodeJS, MongoDB, Redis, pagination, and background processing. The primary goal is to build a simple platform to upload and view files, featuring user authentication via tokens, file uploads, permissions management, thumbnail generation, and more.

## Features

- User authentication via a token
- Listing all files
- Uploading new files
- Changing file permissions
- Viewing files
- Generating thumbnails for images

## Technologies

- Node.js
- Express
- MongoDB
- Redis
- Bull (for background jobs)
- Mocha (for testing)

## Getting Started

### Prerequisites

- Node.js (version 12.x.x)
- MongoDB
- Redis

### Installation

1. Clone the repository:

git clone https://github.com/YOUR_GITHUB/atlas-files_manager.git

2. Navigate to the project directory:

cd atlas-files_manager

3. Install the dependencies:

npm install

4. Set the environment variables:

PORT=5000
DB_HOST=localhost
DB_PORT=27017
DB_DATABASE=files_manager
REDIS_HOST=localhost
REDIS_PORT=6379
FOLDER_PATH=/path/to/your/storage

### Docker commands to work in a group with the same environment/container
### Still testing this part

Commit the changes in the container to a new image:
To save the state of your current container to a new image, use the docker commit command. You'll need the container's ID or name and then tag the new image appropriately.

```sh
docker commit [CONTAINER_ID_OR_NAME] [USERNAME]/[REPOSITORY]:[TAG]
```
[CONTAINER_ID_OR_NAME]: Replace this with your container's ID or name.
[USERNAME]: Your Docker Hub username.
[REPOSITORY]: The repository name on Docker Hub where you want to push the image.
[TAG]: Tag for the image, such as latest or a specific version number like v1.0.
Example:

```sh
docker commit atlas-files_manager_container nomadrob/my_repository:latest
```
Push the new image to Docker Hub:
Once you've committed the changes to a new image, you can push it to Docker Hub using the docker push command.
docker push [USERNAME]/[REPOSITORY]:[TAG]
Replace [USERNAME], [REPOSITORY], and [TAG] with your Docker Hub username, the repository name, and the tag of the image you want to push.

Example:

bash
docker push username/my_repository:latest

Pulling the updated image on your partner's machine:
Once the image is pushed to Docker Hub, your partner can pull this updated image to their local machine using the docker pull command. They'll need to use the same image name and tag you've pushed.

less
docker pull [USERNAME]/[REPOSITORY]:[TAG]
Example:

bash
docker pull username/my_repository:latest
