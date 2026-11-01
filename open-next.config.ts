import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Dummy incremental cache. Pages are dynamic and the account has no R2 bucket.
export default defineCloudflareConfig();
