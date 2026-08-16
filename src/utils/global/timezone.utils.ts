/**
 * The device's IANA timezone — the only geographic signal this app can offer
 * the backend.
 *
 * Telegram tells a bot nothing about where a player is: `initData` carries
 * `language_code` and no location whatsoever, and `ru` alone spans Russia,
 * Belarus, Kazakhstan, Armenia and half a dozen more. The zone the device is
 * set to (`Asia/Yerevan`) names a country; the language does not.
 *
 * Sent once per launch, riding on the login the app already makes — never as a
 * request of its own. It is a statistic for the admin panel, not a credential,
 * and nothing in the app reads it back.
 */
export function getDeviceTimezone(): string | undefined {
  // SSR has no device. Returning undefined rather than a server-side guess
  // matters: the backend leaves what it knows alone when the field is absent,
  // so a render on the server can never overwrite a real player's country with
  // the datacentre's.
  if (typeof Intl === 'undefined') return undefined;

  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Old WebViews resolve to '' or undefined instead of throwing. Both mean
    // "no answer", and sending an empty string would fail validation on the
    // way in and lose the login for a statistic.
    return zone || undefined;
  } catch {
    return undefined;
  }
}

/**
 * The device's locale tag (`fa-IR`, `ru-KZ`) — the second half of the same
 * free signal, sent on the same login.
 *
 * It answers a different question from the zone and must not be confused with
 * it: a zone says where the device IS (an OS moves it the day you land), a
 * locale says where it was SET UP, and an emigrant's two disagree for years.
 * The backend prefers the zone and falls back to this, so the pair also shows
 * when they disagree.
 *
 * Worth having even though the zone almost always arrives: it is what keeps a
 * player from being geographically blank if `Intl` ever answers nothing, and
 * `ru-KZ` places a Russian-speaking player in Kazakhstan where the bare
 * language `ru` places them nowhere at all.
 *
 * A VPN changes neither of them — that is the whole point of both.
 */
export function getDeviceLocale(): string | undefined {
  if (typeof navigator === 'undefined') return undefined;

  // `languages[0]` before `language`: Safari has been known to report a bare
  // `en` in `language` while the full regioned tag sits first in the list.
  const tag = navigator.languages?.[0] || navigator.language;
  // Same rule as the zone: an empty answer is no answer, and sending one would
  // fail validation on the way in and cost the login for a statistic.
  return tag || undefined;
}
