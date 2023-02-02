import { useEffect } from "react";

import { api } from "./api";

export const clearProfileId = () => {
    if (typeof window !== typeof undefined) {
        localStorage.removeItem("profileId");
        window.dispatchEvent(new Event("storage"));
    }
};

export const setProfileId = (id: string) => {
    if (typeof window !== typeof undefined) {
        localStorage.setItem("profileId", id);
        window.dispatchEvent(new Event("storage"));
    }
};

export const getProfileId = () => {
    if (typeof window !== typeof undefined) {
        return localStorage.getItem("profileId");
    }

    return null;
};

export const useProfile = () => {
    const id = getProfileId();

    const profile = api.profile.getById.useQuery(
        {
            id: id as string,
        },
        {
            enabled: !!id,
            notifyOnChangeProps: ["data"],
        }
    );

    useEffect(() => {
        const setProfile = () => {
            const profileId = getProfileId();

            if (profileId) {
                void profile.refetch();
            }
        };

        window.addEventListener("storage", setProfile);

        return () => window.addEventListener("storage", setProfile);
    }, [profile]);

    return profile;
};
