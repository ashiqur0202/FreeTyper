/**
 * Whether the server has everything login needs. Light on purpose (reads settings only),
 * so the layout can ask without loading the auth library.
 */
export function authConfigured(): boolean {
  return (
    !!process.env.DATABASE_URL &&
    !!process.env.BETTER_AUTH_SECRET &&
    !!process.env.BETTER_AUTH_URL &&
    !!process.env.GOOGLE_CLIENT_ID &&
    !!process.env.GOOGLE_CLIENT_SECRET
  );
}
