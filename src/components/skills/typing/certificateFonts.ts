import { Cinzel, EB_Garamond, Pinyon_Script } from 'next/font/google';

// Only used by the certificate picture. This module is imported on demand (the certificate button), so these
// files are fetched when a visitor asks for a certificate, not on every page. next/font needs literal options
// (no spreading), so each call spells them out.
export const cinzel = Cinzel({ subsets: ['latin'], display: 'swap', preload: false, weight: ['500', '700'] });
export const garamond = EB_Garamond({ subsets: ['latin'], display: 'swap', preload: false, weight: ['500', '700'], style: ['normal', 'italic'] });
export const script = Pinyon_Script({ subsets: ['latin'], display: 'swap', preload: false, weight: '400' });
