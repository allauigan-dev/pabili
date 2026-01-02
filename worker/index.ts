/**
 * Pabili Worker Entry Point
 * Handles API requests via Hono
 */

import api from '../src/server';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Handle API routes with Hono
    if (url.pathname.startsWith('/api/')) {
      return api.fetch(request, env, ctx);
    }

    // Return 404 for other non-asset requests
    // Assets are handled by Cloudflare Workers Assets
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
