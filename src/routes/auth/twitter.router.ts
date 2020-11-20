import Router from 'koa-router';
import logger from 'logger';
import passport from 'koa-passport';
import Settings from "services/settings.service";
import Passport from "services/passport.service";
import UserService from "services/user.service";
import { IUser } from "models/user.model";
import { Context, Next } from "koa";
import { IConfig } from "services/settings.service";

Passport.registerPassportStrategies();

const router = new Router({
    prefix: '/twitter',
});

const getUser = (ctx: Context) => ctx.request.query.user || ctx.state.user;

const getOriginApp = (ctx: Context, config:IConfig) => {
    if (ctx.query.origin) {
        return ctx.query.origin;
    }

    if (ctx.session && ctx.session.originApplication) {
        return ctx.session.originApplication;
    }

    return config.defaultApp;
};

class TwitterRouter {

    static async redirectStart(ctx: Context) {
        ctx.redirect('/auth/twitter/start');
    }

    static async startMigration(ctx: Context) {
        return ctx.render('start', {
            error: false,
            generalConfig: ctx.state.generalConfig,
        });
    }

    static async twitter(ctx: Context, next: Next) {
        const config = (await Settings.getInstance()).config;
        const app = getOriginApp(ctx, config);
        // @ts-ignore
        await passport.authenticate(`twitter:${app}`)(ctx, next);
    }

    static async twitterCallbackAuthentication(ctx: Context, next: Next) {
        const config = (await Settings.getInstance()).config;
        const app = getOriginApp(ctx, config);
        await passport.authenticate(`twitter:${app}`, {
            failureRedirect: '/auth/fail',
            // @ts-ignore
        })(ctx, next);
    }

    static async redirectToMigrate(ctx: Context) {
        const user = getUser(ctx);
        ctx.login(user);
        ctx.redirect('/auth/twitter/migrate');
    }

    static async migrateView(ctx: Context) {
        if (!ctx.session) {
            logger.info('No session found. Redirecting to the migration start page.');
            return ctx.redirect('/auth/twitter/start');
        }

        const user = getUser(ctx);
        if (!user) {
            logger.info('No user found in current session when presenting the migration form. Redirecting to the migration start page.');
            return ctx.redirect('/auth/twitter/start');
        }

        return ctx.render('migrate', {
            error: false,
            email: user.email,
            generalConfig: ctx.state.generalConfig,
        });
    }

    static async migrate(ctx: Context) {
        if (!ctx.session) {
            logger.info('No user found in current session when presenting the migration form. Redirecting to the migration start page.');
            return ctx.redirect('/auth/twitter/start');
        }

        const sessionUser = getUser(ctx);
        if (!sessionUser) {
            logger.info('No user found in current session when presenting the migration form. Redirecting to the migration start page.');
            return ctx.redirect('/auth/twitter/start');
        }

        logger.info('Migrating user');
        let error = null;
        if (!ctx.request.body.email || !ctx.request.body.password || !ctx.request.body.repeatPassword) {
            error = 'Email, Password and Repeat password are required';
        }
        if (ctx.request.body.password !== ctx.request.body.repeatPassword) {
            error = 'Password and Repeat password not equal';
        }

        if (error) {
            await ctx.render('migrate', {
                error,
                email: ctx.request.body.email,
                generalConfig: ctx.state.generalConfig,
            });

            return;
        }

        const user: IUser = await UserService.getUserById(sessionUser.id);
        if (!user) {
            error = 'Could not find a valid user account for the current session';
        }

        const migratedUser = await UserService.migrateToUsernameAndPassword(user, ctx.request.body.email, ctx.request.body.password);

        if (error) {
            await ctx.render('migrate', {
                error,
                email: ctx.request.body.email,
                generalConfig: ctx.state.generalConfig,
            });

            return;
        }

        ctx.login(migratedUser);

        return ctx.redirect('/auth/twitter/finished');
    }

    static async finished(ctx: Context) {
        if (!ctx.session) {
            logger.info('No user found in current session when presenting the migration form. Redirecting to the migration start page.');
            return ctx.redirect('/auth/twitter/start');
        }

        const sessionUser = getUser(ctx);
        if (!sessionUser) {
            logger.info('No user found in current session when presenting the migration form. Redirecting to the migration start page.');
            return ctx.redirect('/auth/twitter/start');
        }

        return ctx.render('finished', {
            generalConfig: ctx.state.generalConfig,
        });
    }

    static async failAuth(ctx: Context) {
        logger.info('Not authenticated');

        return ctx.render('start', {
            error: ctx.query.error,
            generalConfig: ctx.state.generalConfig,
        });
    }
}

async function loadApplicationGeneralConfig(ctx: Context, next: Next) {
    const { config } = await Settings.getInstance();

    const app = getOriginApp(ctx, config);
    const applicationConfig = config.applications && config.applications[app];

    if (applicationConfig) {
        ctx.state.application = applicationConfig;
    }

    await next();
}

// @ts-ignore
router.get('/', TwitterRouter.redirectStart);
router.get('/start', loadApplicationGeneralConfig, TwitterRouter.startMigration);
// @ts-ignore
router.get('/auth', TwitterRouter.twitter);
router.get('/callback', TwitterRouter.twitterCallbackAuthentication, TwitterRouter.redirectToMigrate);
router.get('/migrate', loadApplicationGeneralConfig, TwitterRouter.migrateView);
router.post('/migrate', loadApplicationGeneralConfig, TwitterRouter.migrate);
router.get('/finished', loadApplicationGeneralConfig, TwitterRouter.finished);
router.get('/fail', loadApplicationGeneralConfig, TwitterRouter.failAuth);


export { router };
