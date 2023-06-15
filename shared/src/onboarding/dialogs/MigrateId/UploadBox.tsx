import { useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { Button, ErrorBox, Flex, Icon } from '@holium/design-system/general';

import { OnboardDialogDescription } from '../../components/OnboardDialog.styles';
import { ProgressBar, UploadBoxContainer } from './UploadBox.styles';

type Props = {
  fileName?: string;
  progress?: number;
  setFile: (file: File) => void;
  onClickClearUpload: () => void;
};

export const UploadBox = ({
  fileName,
  progress,
  setFile,
  onClickClearUpload,
}: Props) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      console.log('file ==> ', file.name);

      setFile(file);
    });
  };

  const { isDragActive, getRootProps, getInputProps } = useDropzone({
    // .zip or .tar.gz
    accept: {
      'application/zip': ['.zip'],
      'application/gzip': ['.tar.gz'],
    },
    maxFiles: 1,
    maxSize: 3 * 1024 * 1024 * 1024, // 3GB
    disabled: Boolean(fileName),
    onDrop,
    onError: (err) => setError(err.message),
    onDropRejected: () => setError('File type not supported'),
    onDropAccepted: () => setError(null),
  });

  return (
    <>
      <UploadBoxContainer {...getRootProps()} isEmpty={!fileName}>
        {fileName && progress !== undefined ? (
          <Flex flex={1} flexDirection="column" gap="2px">
            <Flex flex={1} justifyContent="space-between">
              <Flex gap="4px">
                {progress === 100 && <Icon name="CheckCircle" />}
                <OnboardDialogDescription
                  style={{ fontSize: 12, fontWeight: 500, opacity: 0.7 }}
                >
                  {fileName}
                </OnboardDialogDescription>
              </Flex>
              {progress === 100 && (
                <Button.IconButton type="button" onClick={onClickClearUpload}>
                  <Icon name="Close" size={20} />
                </Button.IconButton>
              )}
            </Flex>
            <Flex width="100%" height="100%" alignItems="center" gap="8px">
              <ProgressBar progress={progress} />
              <OnboardDialogDescription>{progress}%</OnboardDialogDescription>
            </Flex>
          </Flex>
        ) : (
          <OnboardDialogDescription style={{ fontSize: 13 }}>
            <input {...getInputProps()} />
            {isDragActive ? (
              'Drop the file here ...'
            ) : (
              <>
                Drag and drop pier or <u>click here</u>
              </>
            )}
          </OnboardDialogDescription>
        )}
      </UploadBoxContainer>
      {error && <ErrorBox>{error}</ErrorBox>}
    </>
  );
};
