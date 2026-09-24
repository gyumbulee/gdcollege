import { getInstitutionData } from "@/lib/api/institution";
import { BannerPopupClient } from "./BannerPopupClient";

/**
 * Shows the College's admin-uploaded banner (Institution Settings →
 * /admin/institution) as a once-per-calendar-day popup on the homepage.
 * Renders nothing if no banner has been uploaded yet — never fabricates
 * one (§14 of the spec).
 */
export async function BannerPopup() {
  const { identity, assets } = await getInstitutionData();
  if (!assets.bannerSrc) return null;

  return <BannerPopupClient bannerUrl={assets.bannerSrc} institutionName={identity.formalName} />;
}
