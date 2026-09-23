# Custom Domain Deployment

The academic homepage remains on GitHub Pages at `forevermamba.work`. The
Cloudflare Worker handles only the dynamic application paths declared in
`wrangler.jsonc`, including `/blog`, `/thoughts`, `/editor`, `/api`, and
`/_next`.

## One-time setup

1. Add `forevermamba.work` to Cloudflare. Keep the apex and `www` DNS records
   pointed at `kobeshegu.github.io` and enable the Cloudflare proxy. The
   existing `CNAME` file in `kobeshegu.github.io` must remain
   `forevermamba.work`.
2. At the domain registrar, replace the current nameservers with the two
   assigned by Cloudflare. Wait until the zone status is **Active**.
3. Enable R2 and create the OpenNext cache bucket:

   ```bash
   npx wrangler r2 bucket create tinymind-opennext-cache
   ```

4. In the GitHub OAuth App used by this deployment, set:
   - Homepage URL: `https://forevermamba.work`
   - Authorization callback URL:
     `https://forevermamba.work/api/auth/callback/github`
5. Deploy once from `tinymind/` to create the Worker:

   ```bash
   npm run deploy
   ```

6. Configure runtime secrets without committing them:

   ```bash
   npx wrangler secret put GITHUB_ID
   npx wrangler secret put GITHUB_SECRET
   npx wrangler secret put NEXTAUTH_SECRET
   ```

   `GITHUB_TOKEN` is optional but recommended to raise the GitHub API rate
   limit for public content:

   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```

Cloudflare path routes require the `forevermamba.work` zone to be present in
the same Cloudflare account used by Wrangler. Verify `/`, `/blog`,
`/thoughts`, and the GitHub sign-in callback after deployment.
