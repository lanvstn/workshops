# Workshops

This is an Angular web app to manage workshop registrations. It depends on an API which can be found in the workshops-api repository.

It was made as a school project and I am not maintaining or supporting this.

*Note: The code is in English, but the UI is only in Dutch.*

## Features

- Let users register for workshops in an event
- Authenticate users with a unique login key for each user, either auto-generated or manually set
- Choose which groups of users can register for what
- Link workshops (e.g. A and B must be taken together, C and D can not be combined)
- Import/export users as CSV
- Export registrations as Excel with a worksheet for every workshop

## Installation guide

Things you need before you can start:

* Ubuntu Server 18.04 (other Linux distros should work as well)
* Docker on your server ([instructions for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/#install-using-the-repository))
* This repo

First, set the correct URL for the API in `src/environments/environment.prod.ts`.

```typescript
export const environment = {
  production: true,
  apiEndpoint: "https://api_url_here", // <-- change this
  csvSeparator: ';'
};
```

Build the docker image

```
docker build -t workshops-app .
```

Start the container and set it to always restart

```
docker run -d -p 8080:8080 --name workshops-app workshops-app
```

You should be able to see the info page at http://localhost:8080

Now continue to the workshops-api installation instructions.

## Running for development and testing

Don't do this in production!

Clone this repo, install dependencies and run the dev server:

    $ npm install
    $ ng serve

Go to `http://localhost:4200/`.

*You need Node.js v10 for the npm install to work. It's broken on v12.*

