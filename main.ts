import { Application } from "https://deno.land/x/oak@v9.0.0/mod.ts";
import { testController } from "./testController.ts";

const app = new Application();

new testController('/api/v1', app).init();

await app.listen({port:8000})