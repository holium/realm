import { FC, useRef, useState } from 'react';
import styled from 'styled-components';
import { Label, Button, Box } from '../';
import { ThemeType } from '../../theme';

interface FileUploadContainerProps {
  theme: ThemeType;
  size?: number;
}

export const FileUploadContainer = styled.div<FileUploadContainerProps>`
  background: ${(props: FileUploadContainerProps) =>
    props.theme.colors.bg.tertiary};
  border: 1px solid
    ${(props: FileUploadContainerProps) =>
      props.theme.colors.ui.input.borderColor};
  /* box-sizing: border-box; */
  height: ${(props: FileUploadContainerProps) => props.size || 130}px;
  width: ${(props: FileUploadContainerProps) => props.size || 130}px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  transition: 0.1s ease;
  cursor: pointer !important;
  position: relative;
  border-radius: 4px;
  outline: 1px solid transparent;
  .file-upload-icon {
    transition: fill 0.1s ease;
  }
  &:hover {
    transition: 0.1s ease;
    .file-upload-icon {
      /* transition: fill 0.1s ease;
      svg {
        fill: ${(p) => (p.theme ? p.theme.colors.primary : 'light-blue')};
      } */
    }
    border: 1px solid
      ${(props: FileUploadContainerProps) => props.theme.colors.ui.borderHover};
  }
  &:focus {
    transition: 0.1s ease;
    svg {
      fill: ${(p) => (p.theme ? p.theme.colors.primary : 'light-blue')};
    }
    border: 1px solid
      ${(props: FileUploadContainerProps) => props.theme.colors.brand.primary};
  }
`;

export const FormField = styled.input`
  font-size: 0px;
  width: 100%;
  height: 100%;
  border: none;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: absolute;
  cursor: pointer;
  text-transform: none;
  opacity: 0;
  &:focus {
    outline: none;
  }
`;

export const RemoveFileIcon = styled.i`
  cursor: pointer;
  &:hover {
    transform: scale(1.3);
  }
`;

export const ImagePreview = styled.img`
  border-radius: 3px;
  width: 100%;
  height: 100%;
`;

interface IProps {
  required?: boolean;
  label?: string;
  name?: string;
  icon?: any;
  theme?: any;
  value?: any;
  multiple?: boolean;
  width?: number;
  onNewFile: (files: any) => void;
  onBlur: any;
  onChange: any;
  maxFileSizeInBytes?: number;
}

const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 500000;

const convertNestedObjectToArray = (nestedObj: any) =>
  Object.keys(nestedObj).map((key) => nestedObj[key]);

export const FileUpload: FC<IProps> = ({
  theme,
  required,
  name,
  label,
  onNewFile,
  onBlur,
  onChange,
  icon,
  value,
  width,
  maxFileSizeInBytes = DEFAULT_MAX_FILE_SIZE_IN_BYTES,
  multiple = false,
}: IProps) => {
  const fileInputField = useRef(null);
  const [files, setFiles] = useState<any>({});

  // const handleUploadBtnClick = () => {
  //   // @ts-expect-error
  //   fileInputField.current!.click();
  // };

  const addNewFiles = (newFiles: any) => {
    for (const file of newFiles) {
      if (file.size <= maxFileSizeInBytes) {
        if (!multiple) {
          return { file };
        }
        files[file.name] = file;
      }
    }
    return { ...files };
  };

  const callUpdateFilesCb = (files: any) => {
    const filesAsArray = convertNestedObjectToArray(files);
    onNewFile(filesAsArray);
  };

  const handleNewFileUpload = (evt: any) => {
    const { files: newFiles } = evt.target;
    if (newFiles.length) {
      const updatedFiles = addNewFiles(newFiles);
      setFiles(updatedFiles);
      callUpdateFilesCb(updatedFiles);
      onChange(evt);
    }
  };

  const removeFile = (fileName: string) => {
    delete files[fileName];
    // @ts-expect-error
    fileInputField.current.value = '';
    setFiles({ ...files });
    callUpdateFilesCb({ ...files });
  };

  const file = files.file;

  const isImageFile = file && file.type.split('/')[0] === 'image';

  return (
    <>
      <Box
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          width,
        }}
        color={'color'}
      >
        {label && (
          // @ts-ignore
          <Label mb={1} htmlFor="avatar">
            {label}
          </Label>
        )}
        {/* @ts-ignore */}
        <FileUploadContainer size={width} theme={theme}>
          {!file && <div className="file-upload-icon">{icon && icon}</div>}
          {file && isImageFile && (
            <ImagePreview
              // @ts-ignore
              src={URL.createObjectURL(file)}
              alt={`file preview`}
            />
          )}
          <FormField
            // @ts-ignore
            name={name}
            required={required}
            type="file"
            ref={fileInputField}
            onChange={handleNewFileUpload}
            onBlur={onBlur}
            title=""
            value={value}
            accept=".png,.jpg,.jpeg"
          />
        </FileUploadContainer>
        {file && (
          <Button
            // @ts-ignore
            type="button"
            style={{ margin: '5px 0' }}
            theme={theme}
            onClick={() => removeFile('file')}
          >
            Remove
          </Button>
        )}
      </Box>
    </>
  );
};

FileUpload.defaultProps = {
  width: 132,
};

export default FileUpload;
