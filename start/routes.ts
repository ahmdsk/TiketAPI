/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return {
    status: true,
    message: 'Hello World'
  }
})

Route.group(() => {
  Route.group(() => {
    Route.post('register', 'AuthController.register')
    Route.post('login', 'AuthController.login')
  }).prefix('auth')

  Route.resource('events', 'EventsController').apiOnly()
  Route.get('users/:id/events', 'EventsController.userevents')
  Route.post('events/buy/:id', 'EventsController.buy')
  Route.post('events/join/:id', 'EventsController.join')
}).prefix('api/v1')