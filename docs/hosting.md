# Hosting

Cloudflare Workers free-plan deployment. Runtime applications use OpenNext with a self-reference service binding; static applications serve `out/`. No credentials are committed. Authenticate interactively with Wrangler. Deployments are manual and do not require GitHub Actions secrets. Custom domain ownership must be in the Cloudflare account used for deployment.

For suite applications run all commands from the selected `apps/<name>` directory. Each application has an independent package lock and Worker configuration.
