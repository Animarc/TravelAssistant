import { useState } from 'react';
export default function UserAvatar({ url, username }: { url?: string; username?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return <span className="profile-avatar" aria-hidden="true">{url && failedUrl !== url ? <img src={url} alt="" referrerPolicy="no-referrer" onError={() => setFailedUrl(url)} /> : (username?.trim()[0]?.toUpperCase() ?? 'T')}</span>;
}
