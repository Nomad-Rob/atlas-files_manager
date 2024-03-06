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
