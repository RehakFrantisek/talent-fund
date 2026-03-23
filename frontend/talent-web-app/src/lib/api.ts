import { donations as initialDonations } from "@/src/lib/mockData";
import { store } from "@/src/lib/store";
import { AdminUserUpdatePayload, ApiCampaign, AuthUser, CampaignFilters, CampaignPayload, Donation, PublicProfile } from "@/src/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
const TOKEN_STORAGE = "talent-fund-token";

const supportedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"]);

function isSupportedImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  const clean = url.split("?")[0]?.split("#")[0] ?? "";
  const match = clean.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return true;
  return supportedImageExtensions.has(`.${match[1].toLowerCase()}`);
}

type BackendCategory = "SPORT" | "SCIENCE" | "ART" | "OTHER";

interface BackendCampaignImage {
  id: string;
  url: string;
  sortOrder: number;
}

interface BackendCampaignReward {
  id: string;
  title: string;
  description: string;
  amount: number;
  imageUrl?: string | null;
  sortOrder: number;
}

interface BackendCampaign {
  id: string;
  title: string;
  shortDesc: string;
  story: string;
  category: BackendCategory;
  goalAmount: number;
  currentAmount: number;
  status: ApiCampaign["status"];
  coverImageUrl: string | null;
  images?: BackendCampaignImage[];
  rewards?: BackendCampaignReward[];
  ownerKey: string;
  ownerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

const categoryToBackendMap: Record<ApiCampaign["category"], BackendCategory> = {
  Sport: "SPORT",
  Věda: "SCIENCE",
  Umění: "ART",
  Hudba: "OTHER",
  Technologie: "OTHER",
};

const categoryFromBackendMap: Record<BackendCategory, ApiCampaign["category"]> = {
  SPORT: "Sport",
  SCIENCE: "Věda",
  ART: "Umění",
  OTHER: "Technologie",
};

export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE);
}

function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) localStorage.removeItem(TOKEN_STORAGE);
  else localStorage.setItem(TOKEN_STORAGE, token);
  window.dispatchEvent(new Event("auth-changed"));
}

export function toAbsoluteImageUrl(url: string | null | undefined): string {
  if (!url) return "/placeholders/project-1.svg";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image/")) return url;
  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function mapBackendCampaign(item: BackendCampaign): ApiCampaign {
  const sortedImages = [...(item.images ?? [])].sort((a, b) => a.sortOrder - b.sortOrder).filter((image) => isSupportedImageUrl(image.url));
  const fallbackCover = isSupportedImageUrl(item.coverImageUrl) ? item.coverImageUrl : null;
  const imageUrls = sortedImages.length ? sortedImages.map((image) => image.url) : fallbackCover ? [fallbackCover] : [];

  return {
    id: item.id,
    title: item.title,
    shortDesc: item.shortDesc,
    story: item.story,
    category: categoryFromBackendMap[item.category],
    goalAmount: item.goalAmount,
    currentAmount: item.currentAmount,
    status: item.status,
    coverImageUrl: imageUrls[0] ?? fallbackCover,
    imageUrls,
    images: sortedImages,
    rewards: [...(item.rewards ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    ownerKey: item.ownerKey,
    ownerId: item.ownerId,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapPayloadToBackend(payload: CampaignPayload) {
  return {
    title: payload.title,
    shortDesc: payload.shortDesc,
    story: payload.story,
    category: categoryToBackendMap[payload.category],
    goalAmount: payload.goalAmount,
    coverImageUrl: payload.coverImageUrl,
    imageUrls: payload.imageUrls,
    rewards: payload.rewards,
    ownerKey: payload.ownerKey,
    ownerId: payload.ownerId,
  };
}

async function tryFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });

    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function registerUser(payload: { firstName: string; lastName: string; birthDate: string; username: string; password: string }) {
  const result = await tryFetch<{ token: string; user: AuthUser }>("/auth/register", { method: "POST", body: JSON.stringify(payload) });
  if (!result) return null;
  setAuthToken(result.token);
  return result.user;
}

export async function loginUser(payload: { username: string; password: string }) {
  const result = await tryFetch<{ token: string; user: AuthUser }>("/auth/login", { method: "POST", body: JSON.stringify(payload) });
  if (!result) return null;
  setAuthToken(result.token);
  return result.user;
}

export function logoutUser() {
  setAuthToken(null);
}

export async function getCurrentUser() {
  return tryFetch<AuthUser>("/auth/me");
}

export async function updateMyProfile(payload: {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  password?: string;
  profileImageUrl?: string | null;
  category?: string | null;
  bio?: string | null;
  achievements?: string | null;
}) {
  return tryFetch<AuthUser>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) });
}

export async function listPublicProfiles() {
  return tryFetch<PublicProfile[]>("/auth/profiles");
}

export async function getPublicProfile(id: string) {
  return tryFetch<PublicProfile>(`/auth/profiles/${id}`);
}

export async function uploadCampaignImage(file: File): Promise<string | null> {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? "").split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("read-failed"));
      reader.readAsDataURL(file);
    });

    const token = getAuthToken();
    const response = await fetch(`${API_URL}/campaigns/upload-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ fileName: file.name, data: base64 }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as { url: string };
    return data.url;
  } catch {
    return null;
  }
}

export async function listCampaigns(filters?: CampaignFilters): Promise<ApiCampaign[] | null> {
  const params = new URLSearchParams();
  const singleCategory = filters?.categories?.length === 1 ? filters.categories[0] : filters?.category;
  if (singleCategory && singleCategory !== "Vše") params.set("category", categoryToBackendMap[singleCategory]);
  if (filters?.q) params.set("q", filters.q);
  const singleStatus = filters?.statuses?.length === 1 ? filters.statuses[0] : filters?.status;
  if (singleStatus && singleStatus !== "Vše") params.set("status", singleStatus);
  if (filters?.ownerKey) params.set("ownerKey", filters.ownerKey);
  if (filters?.ownerId) params.set("ownerId", filters.ownerId);
  if (typeof filters?.minGoal === "number") params.set("minGoal", String(filters.minGoal));
  if (typeof filters?.maxGoal === "number") params.set("maxGoal", String(filters.maxGoal));
  if (filters?.sort) params.set("sort", filters.sort);

  const backendData = await tryFetch<BackendCampaign[]>(`/campaigns${params.toString() ? `?${params.toString()}` : ""}`);
  return backendData ? backendData.map(mapBackendCampaign) : null;
}

export async function getCampaignGoalBounds(filters?: CampaignFilters): Promise<{ minGoal: number; maxGoal: number } | null> {
  const params = new URLSearchParams();
  const singleCategory = filters?.categories?.length === 1 ? filters.categories[0] : filters?.category;
  if (singleCategory && singleCategory !== "Vše") params.set("category", categoryToBackendMap[singleCategory]);
  if (filters?.q) params.set("q", filters.q);
  const singleStatus = filters?.statuses?.length === 1 ? filters.statuses[0] : filters?.status;
  if (singleStatus && singleStatus !== "Vše") params.set("status", singleStatus);
  if (filters?.ownerKey) params.set("ownerKey", filters.ownerKey);
  if (filters?.ownerId) params.set("ownerId", filters.ownerId);
  return tryFetch<{ minGoal: number; maxGoal: number }>(`/campaigns/goal-bounds${params.toString() ? `?${params.toString()}` : ""}`);
}

export async function getCampaign(id: string): Promise<ApiCampaign | null> {
  const backendCampaign = await tryFetch<BackendCampaign>(`/campaigns/${id}`);
  return backendCampaign ? mapBackendCampaign(backendCampaign) : null;
}

export async function updateCampaign(id: string, payload: CampaignPayload): Promise<ApiCampaign | null> {
  const backendCampaign = await tryFetch<BackendCampaign>(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify(mapPayloadToBackend(payload)) });
  return backendCampaign ? mapBackendCampaign(backendCampaign) : null;
}

export async function createCampaign(payload: CampaignPayload): Promise<ApiCampaign | null> {
  const backendCampaign = await tryFetch<BackendCampaign>("/campaigns", { method: "POST", body: JSON.stringify(mapPayloadToBackend(payload)) });
  return backendCampaign ? mapBackendCampaign(backendCampaign) : null;
}

export async function updateCampaignStatus(id: string, status: "DRAFT" | "PENDING_REVIEW" | "CHANGES_REQUESTED" | "APPROVED" | "REJECTED" | "COMPLETED" | "DELETED") {
  const backendCampaign = await tryFetch<BackendCampaign>(`/campaigns/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
  return backendCampaign ? mapBackendCampaign(backendCampaign) : null;
}

export async function submitCampaign(id: string): Promise<ApiCampaign | null> {
  const backendCampaign = await tryFetch<BackendCampaign>(`/campaigns/${id}/submit`, { method: "POST" });
  return backendCampaign ? mapBackendCampaign(backendCampaign) : null;
}

export function createDonation(campaignId: string, payload: Omit<Donation, "id" | "campaignId" | "createdAt">): Donation {
  const data = store.getDonations();
  const created: Donation = { id: `d-${Date.now()}`, campaignId, createdAt: new Date().toISOString().slice(0, 10), donorName: payload.donorName, amount: payload.amount, message: payload.message };
  store.setDonations([created, ...data]);
  return created;
}

export function listDonations(campaignId: string): Donation[] {
  const local = store.getDonations();
  const data = local.length ? local : initialDonations;
  return data.filter((donation) => donation.campaignId === campaignId).slice(0, 5);
}


export async function listUsersForAdmin() {
  return tryFetch<AuthUser[]>("/auth/admin/users");
}

export async function updateUserByAdmin(userId: string, payload: AdminUserUpdatePayload) {
  return tryFetch<AuthUser>(`/auth/admin/users/${userId}`, { method: "PATCH", body: JSON.stringify(payload) });
}
