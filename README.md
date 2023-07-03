# Getting Started with node server App

## Installation

Enter to the server folder

```bash
cd server
```

Install the node_modules

```bash
npm i
```

## Available Scripts

you can run:

### `npm start`

- It will run the app with node
- The page will not reload if you make edits.

### `npm run dev`

- Runs the app with nodemon
- The page will reload if you make edits
- The print at the terminal will be cyan with the message:

`server run on: http://localhost:8181/`

And if there are no login errors you should see the message painted in cyan:

`connected to MongoDb!`

## User Types

### Admin Users

- Admin users have full control over the system.
- They can perform view all details of users, delete users and cards, and change card numbers.
- you cannot register as an admin user, please contact the system if you want to be an admin.

### Business Users

- Business users can create cards ,delete their cards, and favorite them.
- They cannot perform actions related to user management excluding to stop being a business card.
- To create a business user, set the isBiz property to "true" during registration.

### Regular Users

- Regular users can only favorite cards.
- They cannot create or update cards.
- To create a regular user, set the isBiz property to "false" during registration.

### Available Routes

### User:

#### Register a new user

POST /http://localhost:8181/api/auth/users

#### Login a user

POST /http://localhost:8181/api/auth/users/login

#### Get all users

GET /http://localhost:8181/api/auth/users

- must provide token
  \*\* must be registered as admin

#### For Information about a user

GET /http://localhost:8181/api/auth/users/:id

request:

- must provide token
  \*\* must be registered either an admin, or the user himself.

#### For User information update/edit

PUT /http://localhost:8181/api/auth/users/:id

- must provide token
  \*\* must be the registered user

#### Change isBusiness status

PATCH /http://localhost:8181/api/auth/users/:id

- must provide token
  \*\* must be the registered user

#### Delete user

DELETE /http://localhost:8181/api/auth/users/:id

- must provide token
  \*\* must be the user who wants to be deleted or to be Admin.

### Cards:

#### To receive all business cards

GET /http://localhost:8181/api/cards

#### To receive all business cards of the registered user

GET /http://localhost:8181/api/cards/my-cards

- must provide token
  You will need to provide a token to get an answer from this api

#### To get a business card of a specific business

GET/ http://localhost:8181/api/cards/:id

id of the card is required

#### To create a new business card

POST /http://localhost:8181/api/cards

request:

- must provide token
  \*\* must registered as biz user

#### To update a business card

PUT/ http://localhost:8181/api/cards/:id

request:

- must provide token
  \*\* must be the registered user who created the card.

#### to edit bizNumber

PUT/ http://localhost:8181/api/biznum/:id
request:

- must provide token
  \*\* must be Admin.

#### To update card like

PATCH http://localhost:8181/api/cards/:id

- must provide token
  \*\* must be a registered user.

#### To delete a business card

DELETE / http://localhost:8181/api/cards/:id

- must provide token
  \*\* must registered the use who created the card or admin user
