import { createAuthClient } from 'better-auth/react';

/** The browser's side of login. It talks to this same site's /api/auth routes. */
export const authClient = createAuthClient();
