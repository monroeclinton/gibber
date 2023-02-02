import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { profileManagerAtom } from "../../atoms";
import { api } from "../../utils/api";
import { getProfileId, setProfileId } from "../../utils/use-profile";
import Button from "../button";
import Modal from "../modal";

const ProfileManager: React.FC = () => {
    const { status: sessionStatus } = useSession();
    const profileId = getProfileId();

    const [profileManager, setProfileManager] = useAtom(profileManagerAtom);

    useEffect(() => {
        const onStorage = () => {
            setProfileManager(getProfileId() === null ? "select" : null);
        };

        window.addEventListener("storage", onStorage);

        return () => window.removeEventListener("storage", onStorage);
    }, [setProfileManager]);

    useEffect(() => {
        if (sessionStatus === "authenticated" && profileId === null) {
            setProfileManager("select");
        }
    }, [sessionStatus, profileId, setProfileManager]);

    return (
        <Modal
            isOpen={profileManager !== null}
            title="Profile Management"
            onClose={
                profileManager === "edit"
                    ? () => setProfileManager(null)
                    : undefined
            }
        >
            <>
                {profileManager === "select" && <SelectProfileForm />}
                {(profileManager === "create" || profileManager === "edit") && (
                    <ProfileForm />
                )}
                <hr className="my-6 h-px border-0 bg-neutral-200" />
                <div className="mt-6 flex">
                    <Button
                        className="grow"
                        color="secondary"
                        onClick={() =>
                            setProfileManager(
                                profileManager === "select"
                                    ? "create"
                                    : "select"
                            )
                        }
                    >
                        {profileManager === "select"
                            ? "New Profile"
                            : "Select Profile"}
                    </Button>
                </div>
            </>
        </Modal>
    );
};

const SelectProfileForm: React.FC = () => {
    const profileId = getProfileId();

    const profiles = api.profile.getAll.useQuery();

    const [profile, setProfile] = useState<string | undefined>(
        profileId ? profileId : undefined
    );

    const changeProfile = () => {
        if (profile) {
            setProfileId(profile);
        }
    };

    useEffect(() => {
        if (profile === undefined && profiles.data && profiles.data[0]) {
            setProfile(profiles.data[0].id);
        }
    }, [profile, profiles.data]);

    return (
        <>
            {profiles.data && profiles.data.length > 0 && (
                <>
                    <div className="mt-6 flex flex-col">
                        <label className="mb-2 text-sm font-semibold">
                            Please select one of your profiles.
                        </label>
                        <select
                            className="grow rounded p-3"
                            value={profile}
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
                        <Button className="grow" onClick={changeProfile}>
                            Use
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

const ProfileForm: React.FC = () => {
    const utils = api.useContext();

    const profileId = getProfileId();

    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [summary, setSummary] = useState<string>("");

    const profile = api.profile.getById.useQuery(
        {
            id: profileId as string,
        },
        {
            enabled: !!profileId,
        }
    );

    const mutation = api.profile.upsert.useMutation({
        onSuccess: (data) => {
            setProfileId(data.id);
            setUsername("");
            setSummary("");

            utils.profile.getAll.setData(undefined, (prevData) => {
                if (prevData) {
                    return [data, ...prevData];
                } else {
                    return [data];
                }
            });

            utils.profile.getByUsername.setData(
                { username: data.username },
                () => {
                    return data;
                }
            );

            utils.profile.getById.setData({ id: data.id }, () => {
                return data;
            });
        },
    });

    const onSubmit = () => {
        mutation.mutate({ name, username, summary });
    };

    useEffect(() => {
        if (profile.data) {
            setName(profile.data.name);
            setUsername(profile.data.username);

            if (profile.data.summary) {
                setSummary(profile.data.summary);
            }
        }
    }, [profile.data]);

    return (
        <>
            {mutation.isError && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800">
                    {mutation.error.message}
                </div>
            )}
            <div className="mt-6 flex">
                <input
                    className="grow rounded-lg border-2 border-none bg-neutral-100 p-3.5 placeholder:text-neutral-600 focus:outline-none"
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
            <div className="mt-6 flex">
                <input
                    className="grow rounded-lg border-2 border-none bg-neutral-100 p-3.5 placeholder:text-neutral-600 focus:outline-none"
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mt-6 flex">
                <textarea
                    rows={4}
                    className="grow rounded-lg border-2 border-none bg-neutral-100 p-3.5 placeholder:text-neutral-600 focus:outline-none"
                    placeholder="Write a summary for the profile..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                ></textarea>
            </div>
            <div className="mt-6 flex">
                <Button className="grow" onClick={onSubmit}>
                    {profile.data ? "Edit" : "Create"}
                </Button>
            </div>
        </>
    );
};

export default ProfileManager;
