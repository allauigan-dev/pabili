/**
 * Pabili Worker Entry Point
 * Handles API requests via Hono
 */

import api from '../src/server';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // With run_worker_first: ["/api/*", "/files/*"], this worker only handles
    // API and file routes. All other routes go directly to SPA assets.
    return api.fetch(request, env, ctx);
  },
} satisfies ExportedHandler<Env>;

