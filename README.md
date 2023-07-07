# Gibber

Gibber is a free, federated, and open source
social network based on [ActivityPub](https://www.w3.org/TR/activitypub/).

## Install

The `docker-compose.yml` file contains configuration for running a development version of Gibber.
It runs a [Next](https://nextjs.org/) server in development and a
[Garage](https://garagehq.deuxfleurs.fr/) object storage server.

Clone this repository and copy `.env.example` to `.env`, `garage.toml.example` to `garage.toml`,
and fill out your details.

Then run `docker compose up`.

To use and configure Garage with the CLI use:

```
docker exec -ti gibber-garage /garage
```

Follow the [Garage guide](https://garagehq.deuxfleurs.fr/documentation/quick-start/#creating-a-cluster-layout)
to configure a layout and a bucket. You must enable website access to the bucket.
