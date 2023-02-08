import type { Prisma } from "@prisma/client";
import classNames from "classnames";

import CloseButton from "../button/CloseButton";

export type AttachmentType = Prisma.AttachmentGetPayload<{
    include: {
        file: true;
    };
}>;

export type RemoveAttachmentType = (attachment: AttachmentType) => void;

const Attachments: React.FC<{
    attachments: AttachmentType[];
    onRemoveAttachment?: RemoveAttachmentType;
}> = ({ attachments, onRemoveAttachment }) => {
    const className = classNames("grid gap-2 h-full w-full", {
        "grid-rows-1": attachments.length <= 2,
        "grid-rows-2": attachments.length > 2,
        "grid-cols-1": attachments.length === 1,
        "grid-cols-2": attachments.length > 1,
    });

    return (
        <div className={className}>
            {attachments.map((attachment, i) => (
                <Attachment
                    attachment={attachment}
                    fill={attachments.length === 3 && i === 0}
                    onRemoveAttachment={onRemoveAttachment}
                    key={attachment.id}
                />
            ))}
        </div>
    );
};

export const Attachment: React.FC<{
    attachment: AttachmentType;
    fill: boolean;
    onRemoveAttachment?: RemoveAttachmentType;
}> = ({ attachment, fill, onRemoveAttachment }) => {
    const className = classNames("overflow-hidden rounded-lg shadow", {
        "row-span-2": fill,
    });

    return (
        <div className={className}>
            {onRemoveAttachment && (
                <div className="absolute right-1 top-1">
                    <CloseButton
                        transparent={true}
                        onClick={() => onRemoveAttachment(attachment)}
                    />
                </div>
            )}
            <img
                className="h-full w-full object-cover"
                alt="Attachment"
                src={attachment.file.url}
            />
        </div>
    );
};

export default Attachments;
