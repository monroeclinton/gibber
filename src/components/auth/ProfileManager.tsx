import { PlusIcon } from "@heroicons/react/24/solid";
import type { File as GibberFile } from "@prisma/client";
import { useAtom } from "jotai";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { profileManagerAtom } from "../../atoms";
import { api } from "../../utils/api";
import {
    getProfileId,
    setProfileId,
    useProfile,
} from "../../utils/use-profile";
import Button from "../button";
import Modal from "../modal";

type FileAndGibberFile = { file?: File; gibberFile: GibberFile };

const ProfileManager: React.FC = () => {
    const { status: sessionStatus } = useSession();
    const { id: profileId } = useProfile();

    const [profileManager, setProfileManager] = useAtom(profileManagerAtom);

    useEffect(() => {
        setProfileManager(
            sessionStatus === "authenticated" && profileId === null
                ? "select"
                : null
        );
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

    const [, setProfileManager] = useAtom(profileManagerAtom);

    const avatarRef = useRef<HTMLInputElement>(null);
    const headerRef = useRef<HTMLInputElement>(null);

    const [init, setInit] = useState<boolean>(true);
    const [header, setHeader] = useState<FileAndGibberFile | null>();
    const [avatar, setAvatar] = useState<FileAndGibberFile | null>();
    const [name, setName] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [summary, setSummary] = useState<string>("");

    const presignedUrls = api.post.createPresignedUrls.useQuery({
        count: 2,
    });

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

            setProfileManager(null);

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

    const onHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (file) {
                setHeader({
                    file,
                    gibberFile: {
                        id: uuidv4(),
                        type: "IMAGE",
                        url: URL.createObjectURL(file),
                        mime: file.type,
                        name: file.name,
                        extension: file.name.split(".").pop() as string,
                        size: file.size,
                        height: null,
                        width: null,
                        createdAt: new Date(),
                    },
                });
            }
        }
    };

    const onAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (file) {
                setAvatar({
                    file,
                    gibberFile: {
                        id: uuidv4(),
                        type: "IMAGE",
                        url: URL.createObjectURL(file),
                        mime: file.type,
                        name: file.name,
                        extension: file.name.split(".").pop() as string,
                        size: file.size,
                        height: null,
                        width: null,
                        createdAt: new Date(),
                    },
                });
            }
        }
    };

    const onSubmit = async () => {
        let headerUpload, avatarUpload;

        if (presignedUrls.data) {
            const headerUploadUrl = presignedUrls.data[0];
            const avatarUploadUrl = presignedUrls.data[1];

            if (headerUploadUrl && header && header.file) {
                await fetch(headerUploadUrl.url, {
                    method: "PUT",
                    body: header.file,
                });

                headerUpload = {
                    key: headerUploadUrl.key,
                    ext: header.file.name.split(".").pop() as string,
                };
            }

            if (avatarUploadUrl && avatar && avatar.file) {
                await fetch(avatarUploadUrl.url, {
                    method: "PUT",
                    body: avatar.file,
                });

                avatarUpload = {
                    key: avatarUploadUrl.key,
                    ext: avatar.file.name.split(".").pop() as string,
                };
            }
        }

        mutation.mutate({
            header: headerUpload,
            avatar: avatarUpload,
            name,
            username,
            summary,
        });
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

            <div className="mt-6 flex flex-col">
                <input
                    className="hidden"
                    type="file"
                    ref={headerRef}
                    onChange={onHeaderChange}
                />
                <input
                    className="hidden"
                    type="file"
                    ref={avatarRef}
                    onChange={onAvatarChange}
                />

                <div className="aspect-w-3 aspect-h-1 bg-neutral-200">
                    <div className="flex items-center justify-center">
                        {header && (
                            <Image
                                alt="Header image"
                                className="h-full w-full"
                                src={header.gibberFile.url}
                                width={615}
                                height={205}
                            />
                        )}

                        <Button
                            className="absolute"
                            color="secondary"
                            iconOnly
                            onClick={() => headerRef.current?.click()}
                        >
                            <PlusIcon width={20} height={20} />
                        </Button>
                    </div>
                </div>

                <div className="relative shrink-0 basis-[50px]">
                    <div className="absolute top-[-50px] left-6 box-content flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border-2 border-white bg-neutral-200">
                        {avatar && (
                            <Image
                                alt="Avatar image"
                                className="h-full w-full"
                                src={avatar.gibberFile.url}
                                width={100}
                                height={100}
                            />
                        )}

                        <Button
                            className="absolute"
                            color="secondary"
                            iconOnly
                            onClick={() => avatarRef.current?.click()}
                        >
                            <PlusIcon width={20} height={20} />
                        </Button>
                    </div>
                </div>
            </div>

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
