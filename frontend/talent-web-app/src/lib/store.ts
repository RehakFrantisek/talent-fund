import { donations } from "@/src/lib/mockData";
import { Donation } from "@/src/lib/types";

const DONATIONS_KEY = "talent-fund-donations";

let inMemoryDonations: Donation[] = [...donations];

function isBrowser() {
  return typeof window !== "undefined";
}

function readDonations(): Donation[] {
  if (!isBrowser()) return inMemoryDonations;
  const raw = localStorage.getItem(DONATIONS_KEY);
  if (!raw) {
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(donations));
    return [...donations];
  }
  return JSON.parse(raw) as Donation[];
}

function writeDonations(next: Donation[]) {
  inMemoryDonations = next;
  if (isBrowser()) {
    localStorage.setItem(DONATIONS_KEY, JSON.stringify(next));
  }
}

export const store = {
  getDonations: () => readDonations(),
  setDonations: (next: Donation[]) => writeDonations(next),
};
