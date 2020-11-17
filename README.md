# Twitter account migration for RW API 

[![Build Status](https://travis-ci.com/resource-watch/twitter-migration.svg?branch=dev)](https://travis-ci.com/resource-watch/twitter-migration)
[![Test Coverage](https://api.codeclimate.com/v1/badges/ee47ecbba622ce13ef72/test_coverage)](https://codeclimate.com/github/resource-watch/twitter-migration/test_coverage)

## Dependencies

The Twitter migration microservice is built using [Node.js](https://nodejs.org/en/), and can be executed either natively or using Docker, each of which has its own set of requirements.

Native execution requires:
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)


Execution using Docker requires:
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Getting started

Start by cloning the repository from github to your execution environment

```
git clone https://github.com/resource-watch/twitter-migration.git && cd twitter-migration
```

After that, follow one of the instructions below:

### Using native execution

1 - Set up your environment variables. See `dev.env.sample` for a list of variables you should set, which are described in detail in [this section](#environment-variables) of the documentation. Native execution will NOT load the `dev.env` file content, so you need to use another way to define those values

2 - Install node dependencies using Yarn:
```
yarn install
```

3 - Start the application server:
```
yarn start
```
Control Tower should now be up and accessible. To confirm, open [http://localhost:9000](http://localhost:9000/) (assuming the default settings) on your browser, which should show a 404 'Endpoint not found' message.

### Using Docker

1 - Create and complete your `dev.env` file with your configuration. The meaning of the variables is available in this [section](#documentation-environment-variables). You can find an example `dev.env.sample` file in the project root.

2 - Execute the following command to run Control tower:

```
./twitter.sh develop
```


Twitter migration should now be up and accessible. To confirm, open [http://localhost:9000](http://localhost:9000/) on your browser, which should show a 404 'Endpoint not found' message.

## Testing

There are two ways to run the included tests:

### Using native execution

Follow the instruction above for setting up the runtime environment for native execution, then run:

```
yarn test
```

### Using Docker

Follow the instruction above for setting up the runtime environment for Docker execution, then run:

```
./twitter.sh test
```

### Environment variables

Core Variables

- PORT => The port where twitter-migration listens for requests. Defaults to 9000 when not set.
- NODE_ENV => Environment variable of nodejs. Required.

OAuth Variables

- TWITTER_CONSUMER_KEY		=> Twitter OAuth consumer key. If's a required field if the Twitter feature in the auth-plugin is active. It's not active by default.
- TWITTER_CONSUMER_SECRET	=> Twitter OAuth consumer secret. If's a required field if the Twitter feature in the auth-plugin is active. It's not active by default.
- CONFIRM_URL_REDIRECT		=> URL to redirect users whenever they activate their account. It's a required field if you offer a local OAuth provider.
- PUBLIC_URL				=> Base Application URL. It must be the public domain of your Control Tower instance, and it's used to compose account links. It you are offering a local OAuth provider it's a required field. This URL also needs to be configured as an acceptable callback on the OAuth provider settings.

Redis Cache variables

- REDIS_PORT_6379_TCP_ADDR => Redis DB host. Required if you activate the Redis cache plugin.
- REDIS_PORT_6379_TCP_PORT => Redis DB port. Required if you activate the Redis cache plugin.


## Contributing

1. Fork it!
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Added some new feature'`
4. Push the commit to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request :D
