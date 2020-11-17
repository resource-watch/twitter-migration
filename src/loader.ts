import fs from 'fs';
import logger from './logger';
import mount from 'koa-mount';
import Application = require('koa');

const routersPath = `${__dirname}/routes`;
/**
 * Load routers
 */
export default (() => {

    const loadAPI = async (app: Application, path: string, pathApi?: string) => {
        const routesFiles = fs.readdirSync(path);
        let existIndexRouter = false;
        for (const file of routesFiles) {
            const newPath = path ? (`${path}/${file}`) : file;
            const stat = fs.statSync(newPath);
            if (!stat.isDirectory()) {
                if (file.lastIndexOf('.router.ts') !== -1) {
                    if (file === 'index.router.ts') {
                        existIndexRouter = true;
                    } else {
                        logger.debug('Loading route %s, in path %s', newPath, pathApi);
                        const module = await import(newPath);
                        if (pathApi) {
                            app.use(mount(pathApi, module.router.middleware()));
                        } else {
                            app.use(module.router.middleware());
                        }
                    }
                }
            } else {
                // is folder
                const newPathAPI = pathApi ? (`${pathApi}/${file}`) : `/${file}`;
                await loadAPI(app, newPath, newPathAPI);
            }
        }
        if (existIndexRouter) {
            // load indexRouter when finish other Router
            const newPath = path ? (`${path}/index.router.ts`) : 'index.router.ts';
            logger.debug('Loading route %s, in path %s', newPath, pathApi);
            const module = await import(newPath);
            if (pathApi) {
                app.use(mount(pathApi, module.router.middleware()));
            } else {
                app.use(module.middleware());
            }
        }
    };

    const loadRoutes = async (app: Application) => {
        logger.debug('Loading routes...');
        await loadAPI(app, routersPath);
        logger.debug('Loaded routes correctly!');
    };

    return {
        loadRoutes
    };

})();
