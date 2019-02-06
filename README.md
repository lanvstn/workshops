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

## Installing in production

Install [Node.js](https://nodejs.org/en/download/).

Clone this repo, then and install dependencies:

    $ npm install

Build the project.

    $ ng build --prod

Install some webserver to serve static files, like nginx. Then copy the files from `dist/` to the directory your server serves from.

Now read the API installation instructions.

## Running for development and testing

Don't do this in production!

Clone this repo, install dependencies and run the dev server:

    $ npm install
    $ ng serve

Go to `http://localhost:4200/`.

