interface IApplication {
    name: string;
    logo: string;
    principalColor: string;
    sendNotifications: boolean;
    emailSender: string;
    emailSenderName: string;
    confirmUrlRedirect: string;
}

interface ITwitter {
    consumerSecret: string;
    consumerKey: string;
    active: boolean;
}

interface IThirdParty {
    twitter?: ITwitter;
}

interface IConfig {
    applications: Record<string, IApplication>;
    publicUrl: string;
    defaultApp: string;
    thirdParty: Record<string, IThirdParty>;
}

class Settings {
    private static instance: Settings;
    public config: IConfig;

    static init() {
        Settings.instance = new Settings();

        Settings.instance.config = {
            applications: {
                rw: {
                    name: "RW API",
                    logo: "https://resourcewatch.org/static/images/logo-embed.png",
                    principalColor: "#c32d7b",
                    sendNotifications: true,
                    emailSender: "noreply@resourcewatch.org",
                    emailSenderName: "Resource Watch",
                    confirmUrlRedirect: "https://resourcewatch.org"
                },
                prep: {
                    name: "PREP",
                    logo: "https://prepdata.org/prep-logo.png",
                    principalColor: "#263e57",
                    sendNotifications: true,
                    emailSender: "noreply@prepdata.org",
                    emailSenderName: "PREP",
                    confirmUrlRedirect: "https://prepdata.org"
                },
                gfw: {
                    name: "GFW",
                    logo: "https://www.globalforestwatch.org/packs/gfw-9c5fe396ee5b15cb5f5b639a7ef771bd.png",
                    principalColor: "#97be32",
                    sendNotifications: true,
                    emailSender: "noreply@globalforestwatch.org",
                    emailSenderName: "GFW",
                    confirmUrlRedirect: "https://www.globalforestwatch.org"
                },
                "forest-atlas": {
                    name: "Forest Atlas",
                    logo: "https://wriorg.s3.amazonaws.com/s3fs-public/styles/large/public/forest-atlases-logo-1.png?itok=BV_4QvsM",
                    principalColor: "#008d6a",
                    sendNotifications: true,
                    emailSender: "noreply@resourcewatch.org",
                    emailSenderName: "Forest Atlas",
                    confirmUrlRedirect: "https://www.wri.org/our-work/project/forest-atlases"
                }
            },
            publicUrl: process.env.PUBLIC_URL,
            defaultApp: "gfw",
            thirdParty: {}
        };

        if (process.env.RW_TWITTER_CONSUMER_KEY && process.env.RW_TWITTER_CONSUMER_SECRET) {
            Settings.instance.config.thirdParty.rw = {
                twitter: {
                    consumerSecret: process.env.RW_TWITTER_CONSUMER_SECRET,
                    consumerKey: process.env.RW_TWITTER_CONSUMER_KEY,
                    active: true
                }
            };
        }

        if (process.env.GFW_TWITTER_CONSUMER_KEY && process.env.GFW_TWITTER_CONSUMER_SECRET) {
            Settings.instance.config.thirdParty.gfw = {
                twitter: {
                    consumerSecret: process.env.GFW_TWITTER_CONSUMER_SECRET,
                    consumerKey: process.env.GFW_TWITTER_CONSUMER_KEY,
                    active: true
                }
            };
        }

        if (process.env.PREP_TWITTER_CONSUMER_KEY && process.env.PREP_TWITTER_CONSUMER_SECRET) {
            Settings.instance.config.thirdParty.prep = {
                twitter: {
                    consumerSecret: process.env.PREP_TWITTER_CONSUMER_SECRET,
                    consumerKey: process.env.PREP_TWITTER_CONSUMER_KEY,
                    active: true
                }
            };
        }
    }

    static getInstance(): Settings {
        if (!Settings.instance) {
            Settings.init();
        }

        return Settings.instance;
    }

}

export { IConfig };
export default Settings;
