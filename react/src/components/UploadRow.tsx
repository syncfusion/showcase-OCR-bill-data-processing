import { CheckBoxComponent } from '@syncfusion/ej2-react-buttons';
import { UploaderComponent } from '@syncfusion/ej2-react-inputs';
import { useEffect, useRef } from 'react';

interface Props {
  enableTable: boolean;
  imageEnhance: boolean;
  status: string;
  isError: boolean;
  onToggleTable: (next: boolean) => void;
  onToggleImageEnhance: (next: boolean) => void;
  onFileSelected: (file: File) => void;
  theme: 'light' | 'dark';
}

export function UploadRow({
  enableTable,
  imageEnhance,
  status,
  isError,
  onToggleTable,
  onToggleImageEnhance,
  onFileSelected,
  theme
}: Props) {
  const uploaderRef = useRef<UploaderComponent | null>(null);

  useEffect(() => {
    if (uploaderRef.current && uploaderRef.current.element.type !== 'file') {
      // The Syncfusion uploader's input type is changed after a refresh. Add it back.
      uploaderRef.current.element.type = 'file';
    }
  });

  return (
    <section className="uploader-row" aria-label="Upload controls">
      <div className={'upload-input' + (theme === 'dark' ? ' e-dark-mode' : '')}>
        <UploaderComponent
          id="upload"
          ref={uploaderRef}
          autoUpload={false}
          multiple={false}
          showFileList={false}
          allowedExtensions="image/*,.pdf"
          buttons={{ browse: 'Choose file' }}
          selected={(args) => {
            const file = args.filesData?.[0]?.rawFile;
            if (file) onFileSelected(file);
          }}
        />
      </div>
      <span className={'status' + (isError ? ' error' : '')}>
        {status}
      </span>
      <div className={'toggles' + (theme === 'dark' ? ' e-dark-mode' : '')}>
        <label>
          <CheckBoxComponent
            label="Enable Table"
            checked={enableTable}
            change={(e) => onToggleTable(!!e.checked)}
          />
        </label>
        <label>
          <CheckBoxComponent
            label="Image Enhance"
            checked={imageEnhance}
            change={(e) => onToggleImageEnhance(!!e.checked)}
          />
        </label>
      </div>
    </section>
  );
}
