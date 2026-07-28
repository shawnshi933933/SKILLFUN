import "express-session";

declare module "express-session" {
  interface SessionData {
    githubUsername?: string;
    walletAddress?: string;
    oauthState?: string;
    /** Nonce issued to this session by GET /api/auth/challenge */
    challengeNonce?: string;
    challengeIssuedAt?: number;
  }
}
