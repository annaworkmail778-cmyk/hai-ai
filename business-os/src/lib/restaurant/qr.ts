/* Table QR links: /q/{session}/{opaque token}. The token identifies a table only, never a guest. */
export const tableQrUrl = (session: string, token: string, origin: string) => `${origin}/q/${session}/${token}`;
