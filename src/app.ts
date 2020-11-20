import config from 'config';
import Koa from 'koa';
import mongoose from 'mongoose';
import koaBody from 'koa-body';
import koaLogger from 'koa-logger';
// @ts-ignore
import koaSimpleHealthCheck from 'koa-simple-healthcheck';
import logger from './logger';
import loader from './loader';
import sleep from 'sleep';
import ErrorSerializer from './serializers/error.serializer';
import passport from 'koa-passport';
import session from 'koa-generic-session';
import redisStore from 'koa-redis';
import views from 'koa-views';

import mongooseDefaultOptions, { MongooseOptions } from '../config/mongoose';
import { Server } from "http";

const mongoUri = process.env.MONGO_URI || `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.database')}`;

let retries = 10;

let mongooseOptions: MongooseOptions = { ...mongooseDefaultOptions };
if (mongoUri.indexOf('replicaSet') > -1) {
    mongooseOptions = {
        ...mongooseOptions,
        db: { native_parser: true },
        replset: {
            auto_reconnect: false,
            poolSize: 10,
            socketOptions: {
                keepAlive: 1000,
                connectTimeoutMS: 30000
            }
        },
        server: {
            poolSize: 5,
            socketOptions: {
                keepAlive: 1000,
                connectTimeoutMS: 30000
            }
        }
    };
}

interface IInit {
    server: Server;
    app: Koa;
}

const init = async ():Promise<IInit> => {
    return new Promise((resolve, reject) => {
        async function onDbReady(err:Error) {
            if (err) {
                if (retries >= 0) {
                    // eslint-disable-next-line no-plusplus
                    retries--;
                    logger.error(`Failed to connect to MongoDB uri ${mongoUri}, retrying...`);
                    sleep.sleep(5);
                    mongoose.connect(mongoUri, mongooseOptions, onDbReady);
                } else {
                    logger.error('MongoURI', mongoUri);
                    logger.error(err);
                    reject(new Error(err.message));
                }

                return;
            }

            const app = new Koa();

            app.use(koaBody({
                multipart: true,
                jsonLimit: '50mb',
                formLimit: '50mb',
                textLimit: '50mb'
            }));
            app.use(koaSimpleHealthCheck());

            app.keys = ['twitter'];
            app.use(session({
                // @ts-ignore
                store: redisStore({
                    url: config.get('redis.url')
                })
            }));

            app.use(views(`${__dirname}/views`, { extension: 'ejs' }));

            app.use(passport.initialize());
            app.use(passport.session());

            app.use(async (ctx, next) => {
                try {
                    await next();
                } catch (inErr) {
                    let error;
                    try {
                        error = JSON.parse(inErr);
                    } catch (e) {
                        logger.debug('Could not parse error message - is it JSON?: ', inErr);
                        error = inErr;
                    }
                    ctx.status = error.status || ctx.status || 500;
                    if (ctx.status >= 500) {
                        logger.error(error);
                    } else {
                        logger.info(error);
                    }

                    ctx.body = ErrorSerializer.serializeError(ctx.status, error.message);
                    if (process.env.NODE_ENV === 'prod' && ctx.status === 500) {
                        ctx.body = 'Unexpected error';
                    }
                    ctx.response.type = 'application/vnd.api+json';
                }
            });

            app.use(koaLogger());

            await loader.loadRoutes(app);

            const port = process.env.PORT || 3000;

            const server = app.listen(port);
            logger.info('Server started in ', port);
            resolve({ app, server });
        }

        logger.info(`Connecting to MongoDB URL ${mongoUri}`);
        mongoose.connect(mongoUri, mongooseOptions, onDbReady);
    });
};

export { init };
