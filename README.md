# owl-boilerplate

app + dashboard boilerplate

## Environment Variables

### Client

| NAME                  | VALUE                         | Description                                                                                        | ENVIRONMENT          |
| --------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------- | -------------------- |
| VITE_APP_BACKEND_URL  | eg: http://localhost:4000/api |                                                                                                    | PRODUCTION / STAGING |
| VITE_APP_MAPBOX_TOKEN | eg: your mapbox token         | Mapbox token that you can find [here](https://docs.mapbox.com/help/getting-started/access-tokens/) | \*                   |

### Server

| NAME             |             VALUE             | Description                                 | ENVIRONMENT          |
| ---------------- | :---------------------------: | ------------------------------------------- | -------------------- |
| APP_NAME         |          eg: FOO-APP          |                                             | \*                   |
| APP_HOST         |  eg: localhost / example.com  |                                             | PRODUCTION / STAGING |
| APP_URL          |   eg: http://localhost:4000   |                                             | \*                   |
| APP_PORT         |             4000              |                                             | \*                   |
| APP_PROTOCOL     |         https / http          |                                             |                      |
| APP_DOMAINS      | eg: ["http://localhost:3000"] | array of domains allowed to talk to the api | \*                   |
| MONGODB_URL      |  eg: mongodb://localhost/foo  |                                             | \*                   |
| DB_NAME          |            eg: foo            |                                             | \*                   |
| SALT             |            eg: 15             | The salt value to encrypt passwords         | \*                   |
| APP_JWT_SECRET   |      eg: keyboardca@aaat      | jwt secret code                             | \*                   |
| APP_EMAIL_SENDER |       eg: any@gmail.com       | email sender id                             | \*                   |
| APP_SMTP_HOST    | eg: smtp.freesmtpservers.com  | any smtp server                             | \*                   |
| APP_SMTP_PORT    |            eg: 25             | the smtp port of the smtp server            | \*                   |
| SESSION_SECRET   |        eg: keybo@rdc@t        | Session encryption secret                   | \*                   |
| SW_SECRET_KEY    |                               | Scaleway secret key (obtained on scaleway)  | \*                   |
| SW_ACCESS_ID     |                               | Scaleway access id (obtained on scaleway)   | \*                   |

## Seeds

```json
    "seed:users": "node ./bin/seeds/users.seed.js",  // seeds users
    "seed:app": "node ./bin/seeds/appSettings.seed.js", // seeds application settings
    "seed:notices": "node ./bin/seeds/notices.seed.js", // seeds notice -> requires to seed user first
```

## Deployment

A runner is configured to listen to any pushes on the `production` branch.
Once your changes complete on the `main` branch, checkout to `production`, merge the changes and `git push origin production`.
This should launch a github action that will build the application on the server and deploy it to https://saojose.huma-num.fr
