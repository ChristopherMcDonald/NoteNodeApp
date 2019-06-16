# NodeNoteApp

The simplest node app I could make which demonstrates CRUD functions, logging, user management and secure sessions. This app allows user to make and store notes.

The intended use of this is to be a reference / base for future node projects.

###### Master Built Status
![Master build status](https://dev.azure.com/ChristopherMcDonaldPersonal/MyFirstProject/_apis/build/status/nodenoteapp%20-%20CI?branchName=master)

## Important Notes

I am currently working on the following features:
- Google / Facebook integration (signup and sharing cards)
- Markdown Formatting on Notes
- JSON web tokens for multi-server support
- More testing

## Versions

- *v1.0.0*: Base functionality, CRUD operations and decent security considerations
- *v1.0.1*: Added email verification, required node update to v11.15.0 due to SendGrid
- *v1.0.2*: Added password reset functionality
- *v1.0.3*: Added pinning notes
- *v1.0.4*: Added text cleanup to ensure no JS could be run
- *v1.1.0*: Production ready (closed beta)

## Prerequisites

You should have these items installed:
- Node (v10.14.\*)
- MongoDB

## Running locally

```
git pull https://github.com/ChristopherMcDonald/NoteNodeApp.git
cd NodeNoteApp
npm install
mongod # should be running on port 27017
node server.js dev
```

## Deployment

Currently live as a closed beta, contact me for URL!

## Testing

Run the tests as follows...

```
git pull https://github.com/ChristopherMcDonald/NoteNodeApp.git
cd NodeNoteApp
npm install
npm install -g mocha
npm test
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
* [SendGrid](https://sendgrid.com) - JS library to send emails, uses templates

## Authors

* **Christopher McDonald** - *Initial work* - [Personal Site](https://christophermcdonald.me)

## Acknowledgements

* **Eric Le Fort** - *Early Adopter, Found Bugs, Recommended Changes*
* **Melissa Robins** - *Early Adopter*

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE.txt](LICENSE.txt) file for details.
