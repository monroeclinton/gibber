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

const FollowingModal: React.FC<IProps> = ({ profileId, isOpen, onClose }) => {
    const following = api.profile.following.useQuery({
        profileId,
    });

    return (
        <Modal isOpen={isOpen} title="Following" onClose={onClose}>
            {following.data?.length === 0 && (
                <div className="rounded bg-neutral-50 p-4 text-neutral-800">
                    There are no profiles here.
                </div>
            )}
            {following.data &&
                following.data.map((follow) => (
                    <div
                        className="mb-3.5 flex items-center"
                        key={follow.followedId}
                    >
                        <div
                            className={classNames(
                                "h-[50px] w-[50px] overflow-hidden rounded-full",
                                {
                                    "bg-neutral-200": !follow.followed.avatar,
                                }
                            )}
                        >
                            {!follow.followed.avatar && (
                                <UserIcon className="m-[25%] w-1/2 text-neutral-400" />
                            )}
                            {follow.followed.avatar && (
                                <Image
                                    alt="Person's avatar"
                                    src={follow.followed.avatar.url}
                                    width={50}
                                    height={50}
                                />
                            )}
                        </div>
                        <p className="ml-3.5">{follow.followed.username}</p>
                    </div>
                ))}
            <></>
        </Modal>
    );
};

export default FollowingModal;
