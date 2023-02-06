import { atom } from "jotai";

export const navOpenAtom = atom<boolean>(false);

type ProfileManager = "select" | "create" | "edit" | null;
export const profileManagerAtom = atom<ProfileManager>(null);

export const createPostAtom = atom<boolean>(false);
export const reblogPostAtom = atom<string | undefined>(undefined);
