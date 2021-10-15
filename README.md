# OFI-API


## DEvelopment

```sh
psql postgres

postgres=# CREATE ROLE ofi_api WITH LOGIN PASSWORD 'ofi_api';
postgres=# ALTER ROLE ofi_api CREATEDB;
postgres=# \du
postgres=# \q

psql -d postgres -U ofi_api

postgres=# CREATE DATABASE ofi_api;
postgres=# \list
postgres=# \c api
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