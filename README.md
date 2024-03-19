# Files Manager

## Overview

This back-end project encapsulates the essence of modern web development. It is designed to be a cumulative experience, highlighting key back-end technologies such as NodeJS, MongoDB, Redis, and the implementation of pagination and background processing tasks. The platform facilitates file management operations, including uploading, viewing, and managing file permissions, augmented with user authentication and thumbnail generation for images.

### Team Members
- Rob Farley
- Shadi Shwiyat

### Project Goals
The objective of this project is to create a robust file management system that supports:
- User authentication using token-based access.
- The ability to list, upload, and manage files.
- Permission modification for files.
- Viewing files and generating thumbnails for image files.

## Technical Stack and Resources
This project leverages a MERN stack (MongoDB, Express.js, React, Node.js) complemented by Redis for session management and temporary data storage, Bull for background job processing, and several other utilities for file handling and thumbnail generation.

- [Express Documentation](https://expressjs.com/en/starter/installing.html)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Redis Official Website](https://redis.io/documentation)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Bull - Premium Queue package for handling distributed jobs](https://optimalbits.github.io/bull/)

## Installation and Running the Project

1. **Clone the Repository**
    ```sh
    git clone [repository-link]
    cd atlas-files_manager
    ```

2. **Install Dependencies**
    Navigate to the project directory and install the necessary dependencies.
    ```sh
    npm install
    ```

3. **Environment Variables**
    Set up the required environment variables for MongoDB, Redis, and the application port.
    - Create a `.env` file in the project root.
    - Add the following configurations:
      ```env
      DB_HOST=localhost
      DB_PORT=27017
      DB_DATABASE=files_manager
      REDIS_HOST=localhost
      REDIS_PORT=6379
      PORT=5000
      FOLDER_PATH=/path/to/your/folder
      ```

4. **Start the Server**
    ```sh
    npm run start-server
    ```

5. **Run the Worker (Optional)**
    For background processing (e.g., thumbnail generation), start the worker in a separate terminal.
    ```sh
    npm run start-worker
    ```

## API Endpoints Overview

The Files Manager API provides various endpoints for managing files and user sessions:

- `POST /users` - Register a new user.
- `GET /connect` - User login generating a unique session token.
- `GET /disconnect` - User logout that invalidates the session token.
- `POST /files` - Upload a file.
- `GET /files` - List all files for the authenticated user.
- More detailed documentation on each endpoint is available in the project's API specification document.


### User Registration

```sh
curl -X POST http://localhost:5000/users -H 'Content-Type: application/json' -d '{"email": "user@example.com", "password": "password123"}'
File Upload
sh
Copy code
curl -X POST http://localhost:5000/files -H "X-Token: <Your-Access-Token>" -F "data=@/path
```

## Some checks we are failing

Task 7: File publish/unpublish
- Route PUT /files/:id/publish with correct :id of the owner - file not published yet
- Route PUT /files/:id/unpublish with correct :id of the owner - file already published yet

Task 9: Image Thumbnails
- got file manager to create new job and save to output, need to fix
resizing of files to 100, 250, 500
