import { FC, useState } from 'react';

export const Uploader: FC<any> = () => {
  const [file, setFile] = useState<any>({});
  const [isImageFile, setIsImageFile] = useState(false);

  return (
    <div></div>
    // <FileUploadContainer size={140}>
    //   {/* {!file && <div className="file-upload-icon">{icon && icon}</div>} */}
    //   {file && isImageFile && (
    //     <ImagePreview src={URL.createObjectURL(file)} alt={`file preview`} />
    //   )}
    //   {/* <FormField
    //     name="dm-attachment"
    //     type="file"
    //     // onChange={uploader}
    //     onBlur={onBlur}
    //     title=""
    //     value={value}
    //     accept=".png,.jpg,.jpeg"
    //   /> */}
    // </FileUploadContainer>
  );
};
