import { createApp, type ApiDatabase } from './app.js';

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const database: ApiDatabase = {
      prepare(sql) {
        const statement = env.DB.prepare(sql);
        return {
          get: (...values) => statement.bind(...values).first(),
          all: async () => (await statement.all()).results,
          run: (...values) => statement.bind(...values).run(),
        };
      },
    };
    return createApp(database).fetch(request, env, ctx);
  },
};
