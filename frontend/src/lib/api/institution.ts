import { institutionConfig } from "@/config/institution.config";
import { apiFetch } from "./client";

export type PublicInstitution = {
  formal_name: string;
  short_name: string;
  motto: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  banner_url: string | null;
};

async function fetchInstitution(): Promise<PublicInstitution | null> {
  try {
    const { body } = await apiFetch<PublicInstitution>("/institution");
    return body.success ? body.data : null;
  } catch {
    return null;
  }
}

export type InstitutionData = ReturnType<typeof merge>;

function merge(live: PublicInstitution | null) {
  return {
    identity: {
      formalName: live?.formal_name || institutionConfig.identity.formalName,
      shortName: live?.short_name || institutionConfig.identity.shortName,
      motto: live?.motto ?? institutionConfig.identity.motto,
    },
    location: {
      address: live?.address ?? institutionConfig.location.address,
      city: live?.city || institutionConfig.location.city,
      state: live?.state || institutionConfig.location.state,
      country: live?.country || institutionConfig.location.country,
    },
    contact: {
      phone: live?.phone ?? institutionConfig.contact.phone,
      email: live?.email ?? institutionConfig.contact.email,
    },
    assets: {
      logoSrc: live?.logo_url ?? institutionConfig.assets.logoSrc,
      bannerSrc: live?.banner_url ?? institutionConfig.assets.bannerSrc,
    },
    // Brand palette and the nav menu structure stay static/build-time —
    // see InstitutionSettingsController's docblock on why colours can't
    // be database-driven at Tailwind build time.
    colors: institutionConfig.colors,
    nav: institutionConfig.nav,
  };
}

/**
 * The single place every public page/layout reads institutional identity
 * from — merges live Institution Settings (admin-editable at
 * /admin/institution) over institution.config.ts's static fallback,
 * never the other way around. A field an admin hasn't filled in yet
 * falls back to the static config's placeholder copy (e.g. "Pending
 * confirmation" wording lives in the consuming component, not here)
 * rather than the page going blank, and if the API is unreachable this
 * degrades to the static config entirely — the public site never breaks
 * because Institution Settings is down.
 */
export async function getInstitutionData() {
  return merge(await fetchInstitution());
}
