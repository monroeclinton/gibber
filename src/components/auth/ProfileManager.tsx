import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { api } from "../../utils/api";
import { getProfileId, setProfileId } from "../../utils/use-profile";
import Button from "../button";
import Modal from "../modal";

const ProfileManager: React.FC = () => {
    const { status: sessionStatus } = useSession();
    const profileId = getProfileId();

    const profiles = api.profile.getAll.useQuery();

    const [profile, setProfile] = useState<string | null>(profileId);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const changeProfile = () => {
        if (profile) {
            setProfileId(profile);
            setIsOpen(false);
        }
    };

    useEffect(() => {
        const onStorage = () => {
            if (getProfileId() === null) {
                setIsOpen(true);
            }
        };

        window.addEventListener("storage", onStorage);

        return () => window.removeEventListener("storage", onStorage);
    }, []);

    useEffect(() => {
        if (profile === undefined && profiles.data && profiles.data[0]) {
            setProfile(profiles.data[0].id);
        }
    }, [profile, profiles.data]);

    useEffect(() => {
        if (sessionStatus === "authenticated" && profileId === null) {
            setIsOpen(true);
        }
    }, [sessionStatus, profileId]);

    return (
        <Modal isOpen={isOpen} title="Profile Management">
            {profiles.data && profiles.data.length > 0 && (
                <>
                    <div className="mt-6 flex flex-col">
                        <label className="mb-2 text-sm font-semibold">
                            Please select one of your profiles.
                        </label>
                        <select
                            className="grow rounded p-3"
                            value={profile ? profile : undefined}
                            onChange={(e) => setProfile(e.target.value)}
                        >
                            {profiles.data.map((profile) => (
                                <option value={profile.id} key={profile.id}>
                                    {profile.username}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mt-6 flex">
                        <Button onClick={changeProfile} className="grow">
                            Use
                        </Button>
                    </div>
                    <hr className="my-6 h-px border-0 bg-neutral-200" />
                    <div className="mt-6 flex">
                        <Button color="secondary" className="grow">
                            New Profile
                        </Button>
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ProfileManager;
