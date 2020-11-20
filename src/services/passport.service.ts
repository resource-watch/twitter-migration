import passport from 'koa-passport';
import logger from 'logger';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import UserService from 'services/user.service';
import Settings from "services/settings.service";
import NoTwitterAccountError from "../errors/noTwitterAccount.error";

class PassportService {

    static async registerPassportStrategies() {

        async function registerUserBasic(
            accessToken: string,
            refreshToken: string,
            profile: Record<string, any>,
            done: (error: any, user?: any) => void
        ) {
            logger.info('[passportService] Registering user', profile);

            const user = await UserService.findOne({
                provider: 'twitter',
                providerId: profile.id,
            });

            logger.info(user);

            if (!user) {
                done(new NoTwitterAccountError());
            } else {
                let email = null;
                if (profile && profile.emails && profile.emails.length > 0) {
                    email = profile.emails[0].value;
                }
                if (email && email !== user.email) {
                    logger.info('[passportService] Updating email');
                    user.email = email;
                    await user.save();
                }
            }
            logger.info('[passportService] Returning user');
            done(null, {
                // eslint-disable-next-line no-underscore-dangle
                id: user._id,
                provider: user.provider,
                providerId: user.providerId,
                role: user.role,
                createdAt: user.createdAt,
                extraUserData: user.extraUserData,
                name: user.name,
                photo: user.photo,
                email: user.email
            });
        }

        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser((user, done) => {
            done(null, user);
        });

        logger.info('[passportService] Loading third-party oauth');
        const appNames: string[] = Object.keys(Settings.getInstance().config.thirdParty);
        appNames.forEach((appName) => {
            logger.info(`[passportService] Loading third-party oauth of app: ${appName}`);
            const app = Settings.getInstance().config.thirdParty[appName];
            if (app.twitter && app.twitter.active) {
                logger.info(`[passportService] Loading twitter strategy of ${appName}`);
                const configTwitter = {
                    consumerKey: app.twitter.consumerKey,
                    consumerSecret: app.twitter.consumerSecret,
                    userProfileURL: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
                    callbackURL: `${Settings.getInstance().config.publicUrl}/auth/twitter/callback`
                };
                const twitterStrategy = new TwitterStrategy(configTwitter, registerUserBasic);
                twitterStrategy.name += `:${appName}`;
                passport.use(twitterStrategy);
            }
        });
    }
}


export default PassportService;
