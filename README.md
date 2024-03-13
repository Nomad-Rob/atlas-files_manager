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


## Docker volumes info
This is done outside of the container and inside the repository folder

1. Identify the Data to Persist
First, determine which data or directories within your container you want to persist. For a MongoDB container, this is typically the /data/db directory where MongoDB stores its database files.

2. Create a Docker Volume
If you haven’t already created a volume for your MongoDB data, you can create one with the following command:

bash
Copy code
docker volume create mongodb_data
This command creates a new volume named mongodb_data that Docker manages. You can list available Docker volumes with docker volume ls.

3. Stop the Current Container
Before updating, stop your current container. Suppose your container's name is my_mongodb:

bash
Copy code
docker stop my_mongodb
4. Remove the Old Container
Once stopped, you can remove the old container. This step is necessary because you typically cannot have two containers with the same name.

bash
Copy code
docker rm my_mongodb
5. Run a New Container with the Updated Image
Now, run a new container using the updated image, making sure to attach the volume you created. If you’re using MongoDB as an example, you might pull the latest MongoDB image and then start a new container like so:

bash
Copy code
docker pull mongo:latest
docker run -d --name my_mongodb -v mongodb_data:/data/db mongo:latest
This command pulls the latest MongoDB image from Docker Hub, then starts a new container named my_mongodb with the mongodb_data volume attached to /data/db inside the container. Any data in /data/db will now persist across container updates.

6. Verify
After the container is up and running, you can verify that your data has persisted by connecting to your MongoDB instance and checking the data.
