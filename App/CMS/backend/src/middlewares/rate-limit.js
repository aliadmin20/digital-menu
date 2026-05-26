"use strict";

const RateLimit = require("koa2-ratelimit").RateLimit;

const limiter = RateLimit.middleware({
  interval: { min: 5 },
  max: 50,
  message: JSON.stringify({
    data: null,
    error: {
      status: 429,
      name: "TooManyRequestsError",
      message: "Too many requests, please try again later.",
    },
  }),
  headers: {
    remaining: "X-RateLimit-Remaining",
    reset:     "X-RateLimit-Reset",
    total:     "X-RateLimit-Limit",
  },
});

module.exports = (config, { strapi }) => {
  return async (ctx, next) => {
    // Skip rate limiting for all Strapi internal routes —
    // only apply to public API endpoints
    if (
      ctx.path.startsWith("/admin") ||
      ctx.path.startsWith("/upload") ||
      ctx.path.startsWith("/content-manager") ||
      ctx.path.startsWith("/content-type-builder")
    ) {
      return next();
    }
    return limiter(ctx, next);
  };
};