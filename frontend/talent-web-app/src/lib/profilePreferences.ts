const PROFILE_IMAGE_PREFIX = "talent-fund-profile-image:";
const PROFILE_GALLERY_PREFIX = "talent-fund-profile-gallery:";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getProfileImage(userId: string): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(`${PROFILE_IMAGE_PREFIX}${userId}`);
}

export function setProfileImage(userId: string, imageDataUrl: string) {
  if (!isBrowser()) return;
  localStorage.setItem(`${PROFILE_IMAGE_PREFIX}${userId}`, imageDataUrl);
}

export function getProfileGallery(userId: string): string[] {
  if (!isBrowser()) return [];
  const raw = localStorage.getItem(`${PROFILE_GALLERY_PREFIX}${userId}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setProfileGallery(userId: string, images: string[]): boolean {
  if (!isBrowser()) return true;

  const key = `${PROFILE_GALLERY_PREFIX}${userId}`;
  let next = [...images];

  while (next.length) {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      return true;
    } catch {
      next = next.slice(1);
    }
  }

  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }

  return false;
}
