/**
 * Social Connect public surface.
 * getAdapter(platform|provider) → SocialPublisher: real Meta/TikTok adapters
 * when their developer-app credentials exist, MockSocialAdapter otherwise
 * (or always when SOCIAL_MOCK=1). buildCaption produces the Arabic
 * auto-caption for any publishable target.
 */

import { MetaAdapter } from "./adapters/meta"
import { TikTokAdapter } from "./adapters/tiktok"
import { MockSocialAdapter } from "./adapters/mock"
import { isMockMode } from "./config"
import {
  isSocialProvider,
  providerForPlatform,
  type SocialPlatform,
  type SocialProvider,
  type SocialPublisher,
} from "./types"

/** Accepts either a platform ("meta_instagram") or a provider ("meta"). */
export function getAdapter(platformOrProvider: SocialPlatform | SocialProvider): SocialPublisher {
  const provider: SocialProvider = isSocialProvider(platformOrProvider)
    ? platformOrProvider
    : providerForPlatform(platformOrProvider)
  if (isMockMode(provider)) return new MockSocialAdapter(provider)
  return provider === "meta" ? new MetaAdapter() : new TikTokAdapter()
}

export { buildAutoCaption as buildCaption, buildAutoCaption, captionTitle } from "./captions"
export { isMockMode, callbackUrl, socialBaseUrl } from "./config"
export { arabicPublishError, patchForResult, publishToAccount, tokenNeedsRefresh } from "./publish-flow"
export * from "./types"
