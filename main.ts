import { Application, Router } from "https://deno.land/x/oak@v9.0.0/mod.ts";

const app = new Application();

const router = new Router();

router
  .get("/", (ctx) => {
    ctx.response.body = "home";
  })
  .get("/test", (ctx) => {
    ctx.response.body = "test";
  })
  .get("/test/:id", (ctx) => {
    console.log(ctx.params.id);
    ctx.response.body = "contact";
  });


app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });