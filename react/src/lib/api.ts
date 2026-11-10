// API surface used by the page. Mirrors the legacy index.html's Uploader
// `selected` handler (lines 238–290) so the React port stays byte-for-byte
// compatible with the backend the legacy HTML already shipped against.
import { apiUrl } from './apiBasePath';

export interface ExtractedField {
  key: string;
  value: string;
}

export interface JobResult {
  fields: ExtractedField[];
  pdf?: string;
}

export type JobStatus = 'queued' | 'processing' | 'succeeded' | 'failed';

export interface JobPollResponse {
  status: JobStatus;
  error?: string;
  result?: JobResult;
}

/** Submit a file for OCR. Returns the server's job id; the caller then
 *  polls until the job finishes. */
export async function submitExtraction(
  file: File,
  enableTable: boolean,
  imageEnhance: boolean
): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  body.append('enableTable', String(enableTable));
  body.append('imageEnhance', String(imageEnhance));
  const url = apiUrl('/api/extract');
  debugger
  const res = await fetch(url, { method: 'POST', body });
  if (!res.ok) throw new Error((await res.text()) || `Error ${res.status}`);
  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error('Server returned no job id');
  return json.id;
}

/** Poll `/api/extract/{id}` every 2 seconds. Transient 502/503/504 and
 *  network errors are silently retried; every other non-OK response throws. */
export async function pollExtraction(
  jobId: string,
  onPoll: (status: 'queued' | 'processing') => void,
  signal?: AbortSignal
): Promise<JobResult> {
  for (;;) {
    if (signal?.aborted) throw new Error('Cancelled');
    await sleep(2000, signal);
    if (signal?.aborted) throw new Error('Cancelled');
    let poll: Response;
    try {
      poll = await fetch(apiUrl('/api/extract/' + jobId));
    } catch {
      // Network error: keep waiting (legacy script's behaviour).
      continue;
    }
    if (poll.status === 502 || poll.status === 503 || poll.status === 504) continue;
    if (!poll.ok) throw new Error((await poll.text()) || `Error ${poll.status}`);
    const job = (await poll.json()) as JobPollResponse;
    if (job.status === 'queued') {
      onPoll('queued');
      continue;
    }
    if (job.status === 'processing') {
      onPoll('processing');
      continue;
    }
    if (job.status === 'failed') throw new Error(job.error ?? 'Job failed');
    if (!job.result) throw new Error('Server returned a succeeded job with no result');
    return job.result;
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new Error('Cancelled'));
    const id = window.setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(id);
      reject(new Error('Cancelled'));
    }, { once: true });
  });
}

/** Convert a File to a data URL so the Syncfusion PdfViewer can load it
 *  without a server round-trip (legacy HTML lines 247–250). */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Failed to read the file'));
    reader.readAsDataURL(file);
  });
}

/** Strip a single pair of surrounding `"` characters, the legacy HTML's
 *  crude `err.message.replace(/^"|"$/g, '')` (line 273). */
export function stripQuotes(value: string): string {
  return value.replace(/^"|"$/g, '');
}
