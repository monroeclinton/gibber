import { atom } from "jotai";

export const navOpenAtom = atom<boolean>(false);

type ProfileManager = "select" | "create" | "edit" | null;
export const profileManagerAtom = atom<ProfileManager>(null);
