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

## Docs

## Deploy (Dokku)

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

# deploy the app

dokku letsencrypt $APP
```
