import _ from 'lodash';
import { useState, ClipboardEvent, useCallback } from 'react';
// import { useFileDrag } from './useDrag';
import { IuseStorage } from './useStorage';

export type FileUploadSource = 'drag' | 'paste' | 'direct';

type FileUploadEventHandlers = {
  onSuccess: (url: string, source: FileUploadSource) => void;
  onError: (error: Error) => void;
};

interface FileUploadHandler {
  onFiles: (
    files: FileList | File[],
    storage?: IuseStorage,
    uploadSource?: FileUploadSource
  ) => void | Promise<void>;
}

const isFileUploadHandler = (onFiles: FileUploadHandler['onFiles']) => {
  return typeof onFiles === 'function';
};

type useFileUploadParams = {
  storage: IuseStorage;
  multiple?: boolean;
} & Partial<FileUploadEventHandlers> &
  Partial<FileUploadHandler>;

export function useFileUpload({
  storage,
  multiple = true,
  onSuccess,
  onError,
  onFiles,
}: useFileUploadParams) {
  const { canUpload, uploadDefault } = storage;
  const [source, setSource] = useState<FileUploadSource>('paste');

  const uploadFiles = useCallback(
    (files: FileList | File[], uploadSource: FileUploadSource) => {
      if (onFiles && isFileUploadHandler(onFiles)) {
        return onFiles?.(files, storage, uploadSource);
      }

      if (!canUpload) {
        return;
      }

      setSource(uploadSource);

      const fileArray = Array.from(files);
      const toUpload = multiple ? fileArray : _.take(fileArray);
      toUpload.forEach((file) => {
        uploadDefault(file)
          .then((url) => onSuccess?.(url, source))
          .catch((err: Error) => {
            console.log(err);
            onError?.(err);
          });
      });
    },
    [
      canUpload,
      multiple,
      onError,
      onFiles,
      onSuccess,
      source,
      storage,
      uploadDefault,
    ]
  );

  // const drag = useFileDrag((f) => uploadFiles(f, 'drag'));

  function onPaste(event: ClipboardEvent) {
    if (!event.clipboardData || !event.clipboardData.files.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    uploadFiles(event.clipboardData.files, 'paste');
  }

  return {
    ...storage,
    onPaste,
    // drag,
  };
}
