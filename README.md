# Events Aggregator App

MeetApp Api - REST Api using Node and Sequelize

## Get started

Sequelize Docs: http://docs.sequelizejs.com/

### 1) Install Dependencies

```
yarn install
```

### 2) Run the Migrations

You might want to change the database credentials in the file `./src/config/database.js` and then run the following command:

```
yarn sequelize db:migrate
```

For more information, take a look at http://docs.sequelizejs.com/

### 3) Start the server

To start the server run the following command:

```
yarn dev
```

Default url: `http://localhost:3334`

##### Endpoints

- Create User - POST - `/users`
- Create new session to receive a JWT Token - POST - `/sessions`
- Update Authenticated User - PUT - `/users`
