import {AppModule} from './app.module.ts';
import {DanetApplication} from 'danet/mod.ts';
import {configAsync} from 'dotenv/mod.ts';
import {loggerMiddleware} from './logger.middleware.ts';
import {SpecBuilder, SwaggerModule} from 'danet_swagger/mod.ts';
import {lookup} from 'mrmime/mod.ts';
import {Context} from "https://deno.land/x/oak@v11.1.0/context.ts";
import {NextFunction} from "https://deno.land/x/danet@1.7.4/src/router/middleware/decorator.ts";

export const bootstrap = async () => {
    await configAsync({export: true});
    const application = new DanetApplication();

    application.danetRouter.setPrefix('/api')

    await application.init(AppModule);

    /**
     * Static file server that skips paths starting with /api docs is /api/spec
     */
    application.use(async (ctx: Context, next: NextFunction) => {
        if (ctx.request.url.pathname.startsWith('/api')) {
            return await next();
        } else {
            let pathname = new URL(ctx.request.url).pathname
            const frontendFiles = '../public/'
            try {
                if (Deno.statSync(`${frontendFiles}/${pathname}`).isFile) {
                    ctx.response.type = lookup(pathname)
                }else{
                    ctx.response.type = 'text/html';
                    pathname = 'index.html'
                }
            } catch (e) {
                ctx.response.type = 'text/html';
                pathname = 'index.html'
            }
            ctx.response.status = 200
            ctx.response.body = await Deno.readTextFile(`${frontendFiles}/${pathname}`)
        }
    })

    const spec = new SpecBuilder()
        .setTitle('Todo')
        .setDescription('The todo API')
        .setVersion('1.0')
        .build();
    const document = await SwaggerModule.createDocument(application, spec);
    await SwaggerModule.setup('spec', application, document);
    application.addGlobalMiddlewares(loggerMiddleware);
    return application;
};
