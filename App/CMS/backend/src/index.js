'use strict';

// ── Windows EBUSY patch ────────────────────────────────────────────────────
// Strapi's upload plugin deletes temp files after S3 upload.
// On Windows the file handle is still open briefly, causing EBUSY errors.
// patch-ebusy.js retries fs.unlink automatically before giving up.
require("../../patch-ebusy");
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  register(/*{ strapi }*/) {},
  bootstrap(/*{ strapi }*/) {},
};