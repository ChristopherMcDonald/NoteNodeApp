# NodeNoteApp

The simplest node app I could make which demonstrates CRUD functions, logging, user management and secure sessions. This app allows user to make and store notes.

The intended use of this is to be a reference / base for future node projects.

## Prerequisites

You should have these items installed:
- Node
- MongoDB

## Running locally

```
git pull https://github.com/ChristopherMcDonald/NoteNodeApp.git
cd NodeNoteApp
npm install
mongod
node server.js
```

## Built With

* [Node](https://nodejs.org/en/) - This allows JS to be run on your computer, works cross-platform
* [Express](https://expressjs.com) - This handles HTTP requests by running Node.js
* [EJS](https://ejs.co) - This is the templating engine, takes HTML and JSON objects to make web pages
* [Mongoose](https://mongoosejs.com) - This is an ORM of sorts, provides a medium between JS objects and MongoDB
* [Bootstrap Templates](https://startbootstrap.com/themes/) - This is used extensively for almost all the visual assets
* [Bootstrap](https://getbootstrap.com) - CSS and JS library
* [MongoDB](https://www.mongodb.com) - NoSQL database
* [jQuery](https://jquery.com) - JS library

## Authors

* **Christopher McDonald** - *Initial work* - [Personal Site](https://christophermcdonald.me)

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.txt](LICENSE.txt) file for details.
