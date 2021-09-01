import {Controller, routeMethod} from "./Controller.ts";

export class testController extends Controller {

    protected routesMethods: Array<routeMethod> = [
        {path: "/", method: this.test, type: "get"}
    ]

    private test(ctx: any) {
        ctx.response.body = "Hello World";
    }
}
