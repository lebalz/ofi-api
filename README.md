# OFI-API

[![Build Status](https://drone.gbsl.website/api/badges/lebalz/ofi-api/status.svg)](https://drone.gbsl.website/lebalz/ofi-api)
[![codecov](https://codecov.io/gh/lebalz/ofi-api/branch/main/graph/badge.svg?token=JMJIYIRISZ)](https://codecov.io/gh/lebalz/ofi-api)

## Development

```sh
psql postgres # sudo -u postgres psql

postgres=# CREATE ROLE ofi_api WITH LOGIN PASSWORD 'ofi_api';
postgres=# ALTER ROLE ofi_api CREATEDB;
postgres=# \du
postgres=# \q

psql -d postgres -U ofi_api

postgres=# CREATE DATABASE ofi_api;
postgres=# \list
postgres=# \c ofi_api
```

Using [pg-migrate](https://github.com/salsita/node-pg-migrate) for migration handling. Run Migrations:

```sh
./node_modules/.bin/node-pg-migrate up
```

Add migration:

```sh
./node_modules/.bin/node-pg-migrate create document-table # creates a migration for documents
```

- [Migrations with Node.js and PostgreSQL](https://www.maibornwolff.de/en/blog/migrations-nodejs-and-postgresql)

In production, migrations are run in the `release` phase, over the [Procfile](./Procfile).


#### Use unauthorized backend (e.g. when developping offline)

When a user already exists, the dev server can be started without azure ad authentication by surpassing the authentication. This comes in handy when developing offline.

```bash
TEST_USER_EMAIL="user@gbsl.ch" yarn run start
```

This will use the [mock strategy](src/auth/mock.ts) for authentication. You can add the `TEST_USER_EMAIL` aswell to the .env file and then run `yarn run start`.

### Troublshooting

#### WSL2: `Can't verify jwt token`

Probably because wsl messes up with the time zone when waking up from sleep mode. --> Sync the time zone with windows

```bash
sudo hwclock -s
```

#### WSL2: `ERRCONNECT` DB Not Running

Start the db service, on WSL:

```bash
sudo service postgresql start
sudo service postgresql status
```


## Docs

## Deploy (Dokku)

### Azure

Register 2 Apps:
- ofi-api (don't set any redirect url)
- ofi-blog (configure as SPA!)

##### ofi-api configuration

1. `Manage > Expose an API`: Add a scope: `access_as_user` with "Admins and users" consent + add the `Application ID URI` (e.g. `http://localhost:3001/api` for development)
2. Add the Client Ids of the applications which can access the api (id of `ofi-blog`)
3. `Manage > Manifest`: set the `accessTokenAcceptedVersion` from `null` to `2` (use V2 of login...)


##### ofi-api configuration
1. Add Redirect URIs for `Single-page application` (!! Not type `web`).
2. Under `Manage > Authentication` Check the boxes 
    - Access tokens (used for implicit flows)
    - ID tokens (used for implicit and hybrid flows) 


## Testing

## Development

### Setup

Create a local test database and set the env variable `TEST_DATABASE_URL` containing the db url for testing (e.g. `postgresql://ofi_api:ofi_api@localhost:5432/ofi_api_test`)
```bash
psql -d postgres -U ofi_api
postgres=# CREATE DATABASE ofi_api_test;
```

Then run

```bash
yarn test
```

this will automatically setup the test db.



#### Troubleshooting
##### db was not erased:
  - recreate the db:

```bash
psql -d postgres -U ofi_api
\l # show all db's
drop database db_sql_development;
CREATE DATABASE db_sql_development;
```

### Configure App

```sh
APP=ofi-api
DOMAIN="your.domain.com"

dokku apps:create $APP
dokku domains:add $APP $DOMAIN
dokku postgres:create $APP
dokku postgres:link $APP $APP
dokku config:set $APP CLIENT_ID="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
dokku config:set $APP TENANT_ID="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
dokku config:set --no-restart $APP DOKKU_LETSENCRYPT_EMAIL="foo@bar.ch"

dokku nginx:set $APP client-max-body-size 5mb

# deploy the app

dokku letsencrypt $APP
```

```sh
git remote add dokku dokku@<your-ip>:ofi-api
git push dokku main:master
```