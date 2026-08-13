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
