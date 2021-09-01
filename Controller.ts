import { Application, Router } from "https://deno.land/x/oak@v9.0.0/mod.ts";
import {routeMethod} from "./interfaces.ts";

interface routeMethod {
    path: string,
    method: (ctx: any) => void,
    type: "delete"|"get"|"head"|"options"|"patch"|"post"|"put"
}

abstract class Controller {

    private router: Router;
    private app: Application;

    protected routesMethods: Array<routeMethod> = [];

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

export {routeMethod, Controller}