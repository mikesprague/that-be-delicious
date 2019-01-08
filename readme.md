## What is this?

[![Greenkeeper badge](https://badges.greenkeeper.io/mikesprague/that-be-delicious.svg)](https://greenkeeper.io/)

This is my version of the "Now That's Delicious" app built during the
[Learn Node](https://learnnode.com/) by @wesbos.

## What's Different?

I followed along for the most part, here's where I diverted:

- All (non-dev) dependencies are now current as of time of writing
- Dependency updates that required syntax changes:
  - `es6-promisify`
    - Before: `promisify(User.register, User)`
    - After: `promisify(User.register.bind(User))`
  - `mongoose`
    - Added to prevent deprecation warnings:
      - `start.js` and `data/load-sample-data.js`
        - `mongoose.set('useCreateIndex', true);`
        - `mongoose.set('useNewUrlParser', true);`
        - `mongoose.set('useFindAndModify', false);`
    - Changed to prevent deprecation warning:
      - `data/load-sample-data.js`
        - Before: `await Store.remove();`
        - After: `await Store.deleteMany();`
  - `body-parser`
    - Removed `body-parser` from project, build into Express now
  - `now`
    - Removed `now` from project, not deploying with it so not needed
  - `moment`
    - Replaced `moment` with `dayjs` which is a lighter weight option for what it's being used for
    - Link: [Day.js - https://github.com/iamkun/dayjs](https://github.com/iamkun/dayjs)
- There were also a handful of code changes unrelated to dependencies:
  - I will list them here when I have time

### Sample Data

To load sample data, run the following command in your terminal:

```bash
npm run sample
```

If you have previously loaded in this data, you can wipe your database 100% clean with:

```bash
npm run blowitallaway
```

That will populate 16 stores with 3 authors and 41 reviews. The logins for the authors are as follows:

|Name|Email (login)|Password|
|---|---|---|
|Wes Bos|wes@example.com|wes|
|Debbie Downer|debbie@example.com|debbie|
|Beau|beau@example.com|beau|


