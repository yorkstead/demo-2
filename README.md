# Rework Flow public demonstration

This is the full Next.js demonstration app, based on operational commit 6806a227d7df005457e620b3f5b7ad52d9ea7e91. The old two-screen prototype is preserved under prototype/.

Deploy only to Vercel project rework-flow-demo, with REWORK_MODE=demo and its separate demo DATABASE_URL. Never connect this anonymous demonstration to operational data. All routes are noindex.

The home page creates a session and provides matching Office, Dock and Driver intake links. Share the complete home-page URL to use the same session on another device. Use fictional details.

The operational sibling remains the protected production application. This folder is a deliberate snapshot; later operational updates must be reviewed before incorporating them here.

Public demo: https://rework-flow-demo.vercel.app

Local launch: bun run dev. The ignored .env.local is configured only for the separate demo database.
