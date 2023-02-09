import { UserIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import Image from "next/image";

import { api } from "../../utils/api";
import Modal from "../modal";

interface IProps {
    profileId: string;
    isOpen: boolean;
    onClose: () => void;
}

const FollowersModal: React.FC<IProps> = ({ profileId, isOpen, onClose }) => {
    const followers = api.profile.followers.useQuery({
        profileId,
    });

    return (
        <Modal isOpen={isOpen} title="Followers" onClose={onClose}>
            {followers.data?.length === 0 && (
                <div className="rounded bg-neutral-50 p-4 text-neutral-800">
                    There are no profiles here.
                </div>
            )}
            {followers.data &&
                followers.data.map((follow) => (
                    <div
                        className="mb-3.5 flex items-center"
                        key={follow.followedId}
                    >
                        <div
                            className={classNames(
                                "h-[50px] w-[50px] overflow-hidden rounded-full",
                                {
                                    "bg-neutral-200": !follow.follower.avatar,
                                }
                            )}
                        >
                            {!follow.follower.avatar && (
                                <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                            )}
                            {follow.follower.avatar && (
                                <Image
                                    alt="Person's avatar"
                                    src={follow.follower.avatar.url}
                                    width={50}
                                    height={50}
                                />
                            )}
                        </div>
                        <p className="ml-3.5">{follow.follower.username}</p>
                    </div>
                ))}
            <></>
        </Modal>
    );
};

export default FollowersModal;
