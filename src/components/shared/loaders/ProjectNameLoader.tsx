import { Wordmark } from '@/components/shared/brand/Wordmark';

/**
 * Route-level loading screen. The `loader` class carries the size and the pulse
 * and is also how TelegramProvider detects that a route is still loading — keep
 * it on the root element. The wordmark inherits its font-size from it.
 */
export default function ProjectNameLoader() {
  return (
    <div className="loader">
      <Wordmark />
    </div>
  );
}
