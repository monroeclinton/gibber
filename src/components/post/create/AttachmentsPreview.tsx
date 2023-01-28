const AttachmentsPreview: React.FC<{ files: File[] }> = ({ files }) => {
    return (
        <div className="flex">
            {files.map((file) => (
                <Attachment file={file} key="test" />
            ))}
        </div>
    );
};

export const Attachment: React.FC<{ file: File }> = ({ file }) => {
    return (
        <div className="overflow-hidden rounded-lg shadow">
            <img
                className="h-[75px] w-[75px] object-cover"
                alt="Attachment"
                src={URL.createObjectURL(file)}
            />
        </div>
    );
};

export default AttachmentsPreview;
