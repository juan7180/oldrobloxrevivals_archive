import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { Elysia, t } from "elysia";
import {
  getFlairs,
  getMediaRoot,
  getMeta,
  getPost,
  loadArchive,
  queryPosts,
} from "./archive";

await loadArchive();

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    }),
  )
  .use(
    staticPlugin({
      assets: getMediaRoot(),
      prefix: "/media",
    }),
  )
  .get("/api/meta", () => getMeta())
  .get("/api/flairs", () => getFlairs())
  .get(
    "/api/posts",
    ({ query }) =>
      queryPosts({
        page: query.page ? Number(query.page) : 1,
        limit: query.limit ? Number(query.limit) : 25,
        sort: query.sort,
        q: query.q,
        scope: query.scope,
        flair: query.flair,
      }),
    {
      query: t.Object({
        page: t.Optional(t.String()),
        limit: t.Optional(t.String()),
        sort: t.Optional(
          t.Union([
            t.Literal("new"),
            t.Literal("old"),
            t.Literal("score"),
            t.Literal("comments"),
          ]),
        ),
        q: t.Optional(t.String()),
        scope: t.Optional(t.Union([t.Literal("posts"), t.Literal("all")])),
        flair: t.Optional(t.String()),
      }),
    },
  )
  .get("/api/posts/:id", ({ params, set }) => {
    const post = getPost(params.id);
    if (!post) {
      set.status = 404;
      return { error: "Post not found" };
    }
    return post;
  })
  .listen(3001);

console.log(
  `Elysia API running at http://${app.server?.hostname}:${app.server?.port}`,
);
