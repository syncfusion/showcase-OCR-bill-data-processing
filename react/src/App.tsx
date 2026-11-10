import { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { AppHeader } from './components/AppHeader';
import { FieldsGrid, type FieldRow } from './components/FieldsGrid';
import { PdfViewerPane, type PdfViewerHandle } from './components/PdfViewerPane';
import { ReviewDialog } from './components/ReviewDialog';
import { Spinner } from './components/Spinner';
import { UploadRow } from './components/UploadRow';
import {
  pollExtraction,
  readFileAsDataUrl,
  stripQuotes,
  submitExtraction
} from './lib/api';

type Theme = 'light' | 'dark';

const PANE_HEIGHT_WIDE = 'calc(100vh - 170px)';
const PANE_HEIGHT_NARROW = '480px';
const POLL_TEXT = 'Extracting, please wait...';
const QUEUE_TEXT = 'Waiting in queue...';
const DEFAULT_STATUS = 'Upload a PDF or screenshot to extract its key-value fields.';

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  return (document.documentElement.dataset.theme as Theme | undefined) ?? 'light';
}

function paneHeight(): string {
  return typeof window !== 'undefined' && window.innerWidth > 900
    ? PANE_HEIGHT_WIDE
    : PANE_HEIGHT_NARROW;
}

export function App() {
  const [enableTable, setEnableTable] = useState(true);
  const [imageEnhance, setImageEnhance] = useState(false);
  const [status, setStatus] = useState<string>(DEFAULT_STATUS);
  const [isError, setIsError] = useState<boolean>(false);
  const [busy, setBusy] = useState<boolean>(false);
  const [busyText, setBusyText] = useState<string>(POLL_TEXT);
  const [rows, setRows] = useState<FieldRow[]>([]);
  const [height, setHeight] = useState<string>(() => paneHeight());
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => readTheme());

  const viewerRef = useRef<PdfViewerHandle | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Resize handling: the legacy script (lines 205–208) updates both heights
  // on the resize event. The React port keeps the same rule.
  useEffect(() => {
    const onResize = () => setHeight(paneHeight());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // The body.busy class hides the Syncfusion controls' own spinner while the
  // page-level spinner is on screen (factory/standards/app-source-baseline.md,
  // "Loading states", "One indicator per area").
  useEffect(() => {
    if (busy) document.body.classList.add('busy');
    else document.body.classList.remove('busy');
  }, [busy]);

  const setStatusMessage = useCallback((message: string, error = false) => {
    setStatus(message);
    setIsError(error);
  }, []);

  const setBusyState = useCallback((on: boolean, text: string = POLL_TEXT) => {
    setBusy(on);
    setBusyText(text);
  }, []);

  const handleRowsChange = useCallback((next: FieldRow[]) => {
    setRows(next);
  }, []);

  const handleReview = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      // Cancel any in-flight job from a previous selection.
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setRows([]);
      setStatusMessage(file.name);
      setBusyState(true, POLL_TEXT);

      try {
        // PDFs open directly in the viewer; images wait for the server to
        // produce a PDF (lines 247–250 of the legacy script).
        if (file.type === 'application/pdf') {
          const dataUrl = await readFileAsDataUrl(file);
          viewerRef.current?.load(dataUrl, null);
        }

        const jobId = await submitExtraction(file, enableTable, imageEnhance);
        const result = await pollExtraction(jobId, (s) => {
          setBusyText(s === 'queued' ? QUEUE_TEXT : POLL_TEXT);
        }, controller.signal);

        if (result.pdf) viewerRef.current?.load(result.pdf, null);
        const nextRows: FieldRow[] = result.fields.map((f, i) => ({
          Id: i,
          Key: f.key,
          Value: f.value
        }));
        setRows(nextRows);
        setStatusMessage(
          `${file.name} — ${nextRows.length} fields. Edit or delete rows, then click Review complete.`
        );
      } catch (err) {
        if (err instanceof Error && err.message === 'Cancelled') return;
        const message = err instanceof Error ? err.message : String(err);
        setStatusMessage(stripQuotes(message), true);
      } finally {
        setBusyState(false);
      }
    },
    [enableTable, imageEnhance, setBusyState, setStatusMessage]
  );

  return (
    <>
      <AppHeader onThemeChange={setTheme} />
      <UploadRow
        enableTable={enableTable}
        imageEnhance={imageEnhance}
        status={status}
        isError={isError}
        onToggleTable={setEnableTable}
        onToggleImageEnhance={setImageEnhance}
        onFileSelected={handleFileSelected}
        theme={theme}
      />
      <main>
        <section className="panel">
          <h2>Preview</h2>
          <PdfViewerPane ref={viewerRef} height={height} isDarkMode={theme === 'dark'} />
        </section>
        <section className="panel">
          <h2>Extracted Data</h2>
          <FieldsGrid rows={rows} height={`calc(${height} - 56px)`} onRowsChange={handleRowsChange} isDarkMode={theme === 'dark'} />
          <div className="review-row">
            <ButtonComponent
              id="review"
              cssClass="e-primary"
              disabled={rows.length === 0}
              onClick={handleReview}
            >
              Review complete
            </ButtonComponent>
          </div>
        </section>
      </main>
      <Spinner visible={busy} text={busyText} />
      {dialogOpen && <ReviewDialog rows={rows} open={dialogOpen} onClose={handleDialogClose} />}
    </>
  );
}
