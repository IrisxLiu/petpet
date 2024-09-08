# PetPet

![PetPet Homepage](https://res.cloudinary.com/dvfvycxxc/image/upload/w_800,h_600/v1725777779/petpet_wzce0c.png)

This is a platform where you can share animal shelters resources and review them.

You can view all the existing resources without an account. Register before posting anything.

## Features

- User registration, login, logout
- View all the shelters on: list, cluster map
- View details of a shelter, including: location, ratings, reviews
- Add new shelters
- Edit/Delete the shelter info you shared
- Rate and review the shelters
- Delete the review you posted

## How to run locally

- Clone the repo
- `cd PetPet`: go to the project's directory
- `npm install`: install required dependencies
- Create a `.env` file in the root directory with the following variables: `LOCAL_DB_URL`, `SESSION_SECRET`, `PORT`
- `npm start`: run project
- `http://localhost:PORT`: replace the port with what you set in the .env file in browser
