/**
 * OAuth redirect handler — /api/social/callback/{meta|tiktok}.
 * Register these exact URLs in each developer app. Verifies the signed
 * state, requires a logged-in owner of the state's restaurant, exchanges
 * the code via the adapter (mock loops back here offline), stores the
 * encrypted tokens and redirects to /dashboard/social?connected=1.
 * Errors redirect with ?error=… — tokens and codes are never logged.
 */

import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdapter, socialBaseUrl } from "@/lib/social"
import { encryptToken, getTokenKey, requireTokenKey } from "@/lib/social/crypto"
import { isSocialPlatform, isSocialProvider, providerForPlatform, type SocialProvider } from "@/lib/social/types"

export const dynamic = "force-dynamic"

function back(params: Record<string, string>): NextResponse {
  const url = new URL("/dashboard/social", socialBaseUrl())
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return NextResponse.redirect(url)
}

function resolveProvider(raw: string): SocialProvider | null {
  if (isSocialProvider(raw)) return raw
  if (isSocialPlatform(raw)) return providerForPlatform(raw)
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
): Promise<NextResponse> {
  const { platform } = await params
  const provider = resolveProvider(platform)
  if (!provider) return back({ error: "unknown_platform" })

  const query = request.nextUrl.searchParams
  if (query.get("error")) return back({ error: "denied" })
  const code = query.get("code")
  const state = query.get("state")
  if (!code || !state) return back({ error: "invalid_callback" })

  const adapter = getAdapter(provider)

  try {
    const result = await adapter.handleCallback(code, state)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return back({ error: "auth_required" })
    const { data: restaurant } = await supabase
      .from("restaurants")
      .select("id")
      .eq("id", result.restaurantId)
      .eq("user_id", user.id)
      .single()
    if (!restaurant) return back({ error: "not_owner" })

    const key = adapter.mock ? getTokenKey().key : requireTokenKey()
    for (const account of result.accounts) {
      const { error } = await supabase.from("social_accounts").upsert(
        {
          restaurant_id: result.restaurantId,
          platform: account.platform,
          account_name: account.accountName,
          account_ref: account.accountRef,
          access_token_encrypted: encryptToken(account.tokens.accessToken, key),
          refresh_token_encrypted: account.tokens.refreshToken
            ? encryptToken(account.tokens.refreshToken, key)
            : null,
          token_expires_at: account.tokens.expiresAt,
          scopes: account.tokens.scopes,
          status: "connected",
        },
        { onConflict: "restaurant_id,platform,account_ref" }
      )
      if (error) {
        console.error(`[social:callback:${provider}] account upsert failed: ${error.message}`)
        return back({ error: "store_failed" })
      }
    }
    return back({ connected: "1" })
  } catch (err) {
    // Never log code/state/tokens — message only.
    console.error(`[social:callback:${provider}] ${err instanceof Error ? err.message : "unknown error"}`)
    return back({ error: "callback_failed" })
  }
}
