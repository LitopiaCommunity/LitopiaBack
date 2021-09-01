import { Application, Router } from "https://deno.land/x/oak@v9.0.0/mod.ts";
import {RouteMethod} from "./RouteMethode.ts";

abstract class Controller {

    private router: Router;
    private app: Application;

    protected routesMethods: Array<RouteMethod> = [];

    constructor(apiPrefix: string, app: Application) {
        this.app = app;
        this.router = new Router({prefix: apiPrefix});
    }


    protected initRoute() {
        this.routesMethods.forEach(({path, method, type}) => {
            // @ts-ignore
            this.router[type](path, (ctx) => method(ctx));
        });
    }

    public init() {
        this.initRoute();
        this.app.use(this.router.routes());
        this.app.use(this.router.allowedMethods());
    }


}

export {Controller}