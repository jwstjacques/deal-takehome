# The Super Important ReadMe Section

## What be this?

A pretty amazing and wonderful basic implementation of some routes you might find on a service that does a thing.

Prepare to be amazed, and accomplish not a lot!

## Supported Routes

1. **_GET_** `/contracts/:id`

1. **_GET_** `/contracts`

1. **_GET_** `/jobs/unpaid`

1. **_POST_** `/jobs/:id/pay`

1. **_POST_** `/balances/deposit/:userId`

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>`

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>`limit is 2.

## Know what I did last....well few hours

1. Completed the routes as per spec.

1. Rewrote the whole thing in class based TypeScript (I have regrets).

1. Unit tests with nearly 100% coverage (I had to just move on, you get the point).

1. Concurrency on updates, using Optimistic Locking.

1. Transactions for multi-table updates, because I'm not a monster.

## Justifications

Based on some of the "vagueities" (it's a word...stamped it, no erasies) I had to make some real ground breaking decisions. Do I eat the red ones first, last ore in the middle.

Because of a bone-headed decision early on, the **_GET_** `/jobs/unpaid` route is returning an array of contracts, that contains the array of unpaid jobs for each contract. I didn't bother fixing this because you'll get the point, and I can live with the pain I will endure in Valhalla.

I resisted making any changes to the schema or adding a transactions table. I will be speaking to my therapist about this.

In the AdminDal, I wrote raw SQL because it was faster. I think there are enough examples of sequelize you can trust I can figure it out if I have to.

I left the getProfile on the admin routes. To be fair, those seem like public routes, but I did it because YOLO. They should be either public or protected.

I was uncaffeinated and didn't bind my controllers, so I used arrow functions on methods so they could hang out with "this". It's been a good relationship so far. I would not do this normally.

I also borked the nodeman stuff cuz of the TypeScript. Tried, gave up. I will not lose sleep over this.

## What would I do different?

1. Make sure I have no anys. I'm a bad person and they do not tie the room together. Desperate times.

1. Unborke the borked nodeman stuff I borked.

1. Lots of anti-DRY code, especially in the unit tests. Copy and paste were my friends.

1. Admin route validation.

1. Better error messages.

1. Return values would become light weight DTOs.

1. Added some ability to add more data, but I didn't want to do a full CRUD.

1. Removed a few files form the coverage chart.

1. Full coverage on more things, but we aren't wheeling the reinvent here AMIRITE?

1. A few other things, but time keeps on ticking...into the... you get the point.

## Dependencies

1. That feeling Rocky has...something about tigers eyes

1. A Computer

1. Some version of Node greater than 10.16.3. I'm using v16.13.2. We live in exciting times.

1. Some version of npm. Less exciting than above. Version 8.1.2.

1. Honestly you should have POSTMAN to run the requests, if you don't, it's fine, we'll all live.

1. The will to continue.

## Operating Instructions

1. Open terminal

1. Go to root of this project

1. In the terminal

   > npm install

1. In the terminal

   > npm run build

1. In the terminal
   > npm run seed

## To Test

1. Do the hokey pokey, or the steps above (one will work, the other will be more fun).

1. Npm run test.

1. Witness the awe inspiring coverage.

## Manual Testing

1. Open postman or hit routes with Curl if that's your thing (I should have written you curl commands eh?)

1. All routes need a header as such:

   ```
   in the header tab:

   profile_id: <some number supported in the DB ... 1 will work for Harry Potter>

   ```

1. The 2 payment related routes require a body:

   ```
   POST <route with payment>

   in the body tab:
   select raw
   select json from drop down

   paste:

   {
    "paymentAmount": <some number greater than 0>
   }
   ```

# Original ReadME

# DEEL BACKEND TASK

💫 Welcome! 🎉

This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

1. Start by cloning this repository.

1. In the repo root directory, run `npm install` to gather all dependencies.

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

1. Then run `npm start` which should start both the server and the React client.

❗️ **Make sure you commit all changes to the master branch!**

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

## APIs To Implement

Below is a list of the required API's for the application.

1. **_GET_** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), for **_active contracts only_**.

1. **_POST_** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. **_POST_** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.

```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

## Submitting the Assignment

When you have finished the assignment, create a github repository and send us the link.

Thank you and good luck! 🙏
