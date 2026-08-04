import "express-session";

declare module "express-session" {
  interface SessionData {
    githubUsername?: string;
    walletAddress?: string;
    oauthState?: string;
    oauthReturnTo?: string;
    /** Nonce issued to this session by GET /api/auth/challenge */
    challengeNonce?: string;
    challengeIssuedAt?: number;
    /** GitHub OAuth access token — present when user authorised with 'repo' scope */
    githubToken?: string;
    /** Whether the stored token includes private-repo ('repo') scope */
    githubTokenHasRepoScope?: boolean;
  }
}
