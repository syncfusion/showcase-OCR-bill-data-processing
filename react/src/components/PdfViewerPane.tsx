import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import {
  PdfViewerComponent,
  Inject,
  Toolbar,
  Magnification,
  Navigation,
  LinkAnnotation,
  ThumbnailView,
  BookmarkView,
  TextSelection,
  Annotation,
  FormFields,
  FormDesigner
} from '@syncfusion/ej2-react-pdfviewer';

// Use local ej2-pdfviewer-lib files instead of CDN.
// The resourceUrl points to the directory containing pdfium.js and pdfium.wasm,
// which are required at runtime for WASM-based PDF processing.
// These files are served from the public directory via Vite.
// We use an absolute URL with the full base path to ensure it works in both
// development and production environments.
const getResourceUrl = () => {
  if (typeof window === 'undefined') return '/ej2-pdfviewer-lib';
  
  try {
    // Construct absolute URL with origin and full base path
    return `${window.location.origin}/ocr-bill-data-processing/react/ej2-pdfviewer-lib`;
  } catch {
    // Fallback to relative path if origin is not available
    return '/ocr-bill-data-processing/react/ej2-pdfviewer-lib';
  }
};

const RESOURCE_URL = getResourceUrl();

// Log the resource URL for debugging
console.log('[PdfViewerPane] Resource URL:', RESOURCE_URL);

export interface PdfViewerHandle {
  load: (dataUrl: string, password?: string | null) => void;
}

interface Props {
  height: string;
  isDarkMode?: boolean;
}

type PdfViewerInstance = PdfViewerComponent;

export const PdfViewerPane = forwardRef<PdfViewerHandle, Props>(function PdfViewerPane(
  { height, isDarkMode = false },
  ref
) {
  // The component exposes `load(...)` on its instance. We capture the instance
  // through a typed ref so the parent can call `load(...)` from its async
  // file-selection handler.
  const instanceRef = useRef<PdfViewerInstance | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      load: (dataUrl, password) => {
        // The legacy script passed `null` for the password (a no-password PDF).
        // The React PdfViewerComponent types this parameter as `string`, so we
        // coerce `null` to an empty string.
        instanceRef.current?.load(dataUrl, password ?? '');
      }
    }),
    []
  );

  const setInstance = useCallback((instance: PdfViewerInstance | null) => {
    instanceRef.current = instance;
  }, []);

  // Module-level handlers (syncfusion-component-patterns.md, "Templates:
  // module level, precomputed fields"): the JSX opening tag stays simple and
  // a single render path covers the document lifecycle.
  const onDocumentLoad = useCallback(() => {
    // The legacy script continued silently on success.
  }, []);
  const onDocumentLoadFailed = useCallback(() => {
    // The app's spinner overlay covers this pane during the in-flight job,
    // so a load failure here is rare. Surface it to the status line via
    // a console signal — the parent owns the status state.
    console.error('[PdfViewerPane] Document load failed');
  }, []);

  const onControlCreated = useCallback(() => {
    console.log('[PdfViewerPane] PdfViewerComponent created successfully');
  }, []);

  return (
    <div className={isDarkMode ? 'e-dark-mode' : ''} style={{ height }}>
      <PdfViewerComponent
        id="viewer"
        ref={setInstance as never}
        resourceUrl={RESOURCE_URL}
        height="100%"
        documentLoad={onDocumentLoad}
        documentLoadFailed={onDocumentLoadFailed}
        created={onControlCreated}
      >
        <Inject
          services={[
            Toolbar,
            Magnification,
            Navigation,
            LinkAnnotation,
            ThumbnailView,
            BookmarkView,
            TextSelection,
            Annotation,
            FormFields,
            FormDesigner
          ]}
        />
      </PdfViewerComponent>
    </div>
  );
});
