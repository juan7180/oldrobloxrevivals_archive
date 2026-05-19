import { cors } from "@elysiajs/cors";
import { Elysia, t } from "elysia";
import { env } from "./env";
import {
  getFlairs,
  getMeta,
  getPost,
  loadArchive,
  queryPosts,
} from "./archive";

const archiveReady = loadArchive();

export const app = new Elysia({ prefix: "/api" })
  .use(
    cors({
      origin: env.corsOrigins,
    }),
  )
  .onBeforeHandle(async () => {
    await archiveReady;
  })
  .get("/meta", () => getMeta())
  .get("/flairs", () => getFlairs())
  .get(
    "/posts",
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
  .get("/posts/:id", ({ params, set }) => {
    const post = getPost(params.id);
    if (!post) {
      set.status = 404;
      return { error: "Post not found" };
    }
    return post;
  });
