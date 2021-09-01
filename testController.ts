import {Controller} from "./app/Controller.ts";

export class testController extends Controller {

    protected routesMethods: Array<RouteMethod> = [
        {path: "/", method: this.test, type: "get"}
    ]

    private test(ctx: any) {
        ctx.response.body = "Hello World";
    }
}
