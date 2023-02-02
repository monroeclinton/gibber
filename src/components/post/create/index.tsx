import { PhotoIcon } from "@heroicons/react/24/solid";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import { api } from "../../../utils/api";
import { useProfile } from "../../../utils/use-profile";
import Button from "../../button";
import type { AttachmentType } from "../Attachments";
import Attachments from "../Attachments";

type FileAndAttachment = { file: File; attachment: AttachmentType };

const CreatePost: React.FC = () => {
    const { profile } = useProfile();

    const utils = api.useContext();

    const ref = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState<string>("");
    const [previewAttachments, setPreviewAttachments] = useState<
        FileAndAttachment[]
    >([]);

    const presignedUrls = api.post.createPresignedUrls.useQuery(
        {
            count: previewAttachments.length,
        },
        {
            enabled: previewAttachments.length > 0,
        }
    );

    const post = api.post.create.useMutation({
        onSuccess: (data) => {
            setContent("");
            setPreviewAttachments([]);

            if (profile.data?.id) {
                utils.post.getByProfileId.setData(
                    { profileId: profile.data.id },
                    (prevData) => {
                        if (prevData) {
                            return [data, ...prevData];
                        } else {
                            return [data];
                        }
                    }
                );
            }
        },
    });

    const onRemoveAttachment = (attachment: AttachmentType) => {
        const newPreviewAttachments = previewAttachments.filter(
            (p) => p.attachment !== attachment
        );

        setPreviewAttachments(newPreviewAttachments);
    };

    const onFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newPreviewAttachments = [];

            for (const file of e.target.files) {
                const attachment = {
                    id: uuidv4(),
                    postId: uuidv4(),
                    fileId: uuidv4(),
                    createdAt: new Date(),
                    file: {
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
                };

                newPreviewAttachments.push({
                    attachment,
                    file,
                });
            }

            setPreviewAttachments([
                ...previewAttachments,
                ...newPreviewAttachments,
            ]);
        }
    };

    const onSubmit = async () => {
        const uploads: { key: string; ext: string }[] = [];

        if (previewAttachments.length && presignedUrls.data) {
            for (let i = 0; i < previewAttachments.length; i++) {
                const previewAttachment = previewAttachments[i];
                const data = presignedUrls.data[i];

                if (previewAttachment && data && data.key && data.url) {
                    const { attachment, file } = previewAttachment;

                    await fetch(data.url, {
                        method: "PUT",
                        body: file,
                    });

                    uploads.push({
                        key: data.key,
                        ext: attachment.file.extension,
                    });
                }
            }
        }

        if (profile.data) {
            post.mutate({
                profileId: profile.data.id,
                content,
                files: uploads,
            });
        }
    };

    const isDisabled =
        (!content.length && !previewAttachments.length) ||
        !profile.data ||
        profile.isFetching ||
        presignedUrls.isFetching;

    return (
        <div className="flex flex-col p-3.5">
            <textarea
                rows={4}
                className="grow rounded-lg border-2 border-none bg-neutral-100 p-3.5 placeholder:text-neutral-600 focus:outline-none"
                placeholder="Write something here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
            ></textarea>
            {previewAttachments && (
                <div className="mt-3.5 grid gap-2">
                    <Attachments
                        attachments={previewAttachments.map(
                            (attachment) => attachment.attachment
                        )}
                        onRemoveAttachment={onRemoveAttachment}
                    />
                </div>
            )}
            <div className="mt-3.5 flex items-start">
                <input
                    ref={ref}
                    className="hidden"
                    type="file"
                    multiple
                    onChange={onFilesChange}
                />
                <Button
                    color="secondary"
                    iconOnly
                    onClick={() => ref.current?.click()}
                >
                    <PhotoIcon width={20} height={20} />
                </Button>
                <Button
                    disabled={isDisabled}
                    className="ml-auto"
                    onClick={() => void onSubmit()}
                >
                    Post
                </Button>
            </div>
        </div>
    );
};

export default CreatePost;
