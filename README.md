# OCR Bill Data Processing Showcase

An OCR-powered showcase application that extracts key-value data from bills, receipts, and invoices. Upload a PDF or image, review and correct the extracted fields beside the document preview, then open the reviewed data in a spreadsheet for download.

This is a showcase, not a production document-management system. It has no database, user accounts, approval workflow, or document archive. Extraction jobs are held in server memory and reviewed data stays in the browser until exported.

## Features

- Upload a PDF, PNG, JPG, or JPEG bill or invoice
- Extract labeled fields using Syncfusion Smart Data Extractor and OCR
- Optionally enable table detection and image enhancement
- Preview the uploaded document in a PDF Viewer; uploaded images are converted to PDF for preview and extraction
- Edit or delete extracted rows in a grid
- Review the corrected data in a spreadsheet and export it using the spreadsheet's Save As options
- Light and dark themes, queued-job status, and cancellation of the current browser poll when another file is selected

## Technology

| Layer | Technology |
| --- | --- |
| API | ASP.NET Core minimal API on .NET 10, Syncfusion Smart Data Extractor, OCR Processor, and Spreadsheet save API |
| Client | React 19, TypeScript, Vite, Syncfusion React PDF Viewer, Grid, Spreadsheet, Uploader, and Dialog |
| Job state | In-memory queue and job registry; no database or persistent storage |

## How it works

1. The browser uploads a PDF or image to `POST /api/extract` with the table-detection and image-enhancement options.
2. The API validates the file, creates an extraction job, queues it, and immediately responds with `202 Accepted` and a job ID.
3. A single background worker processes jobs in order. The client polls `GET /api/extract/{id}` until extraction completes or fails.
4. The client displays the extracted fields in an editable grid. It loads a PDF preview directly for PDF uploads; image uploads receive a PDF preview from the API.
5. **Review complete** opens the spreadsheet. Saving sends the workbook to `POST /api/spreadsheet/save`, which returns a downloadable file.

Supported uploads are `.pdf`, `.png`, `.jpg`, and `.jpeg`; the API request limit is 20 MB. Completed jobs are removed from memory after 30 minutes. Extraction is serialized because the OCR model is large, and the first extraction may take longer while the model initializes.

## Repository structure

```text
.
├── react/                              # React + Vite client
│   ├── src/
│   │   ├── components/                 # Upload, PDF preview, fields grid, review dialog, and UI
│   │   ├── lib/                        # Extraction API client and API base URL
│   │   ├── App.tsx                     # Upload-to-review workflow
│   │   └── styles.css
│   ├── public/ej2-pdfviewer-lib/       # PDF Viewer runtime assets
│   ├── package.json
│   └── vite.config.ts
├── webapi/
│   └── src/IncidentExtractor/          # ASP.NET Core API (net10.0, x64)
│       ├── Program.cs                  # OCR queue, extraction endpoints, spreadsheet save, image-to-PDF
│       ├── appsettings.json            # API path base
│       ├── Properties/launchSettings.json
│       └── wwwroot/                    # API-hosted static files
└── README.md
```

## Run locally

### Prerequisites

- .NET 10 SDK
- 64-bit .NET process; the project targets x64 because the OCR model requires substantial memory
- Node.js LTS and npm
- A valid Syncfusion license for the Syncfusion components used by the app

### Start the API

```powershell
cd webapi/src/IncidentExtractor
dotnet restore
dotnet run --launch-profile http
```

The HTTP launch profile listens on `http://localhost:5052`. The API is mounted at `/aspnet-core-ocr-bill-data-processing`; its extraction endpoint is therefore `http://localhost:5052/aspnet-core-ocr-bill-data-processing/api/extract`.

### Start the React client

```powershell
cd react
npm install
npm run dev
```

Open the Vite URL shown in the terminal, using the base path configured in `react/vite.config.ts` if required. The API client in `react/src/lib/apiBasePath.ts` currently points to the deployed staging API. To use the local API, change that base URL to `http://localhost:5052/aspnet-core-ocr-bill-data-processing` before starting the client.

The Vite production build uses the `/ocr-bill-data-processing/react/` asset base path. The ASP.NET API's configured path base is `/aspnet-core-ocr-bill-data-processing`; these are separate deployment paths.

## API

All routes are served under the configured path base, `/aspnet-core-ocr-bill-data-processing` by default.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/extract` | Accept a multipart upload (`file`, `enableTable`, `imageEnhance`) and enqueue an OCR job; returns `{ id }` with `202 Accepted` |
| `GET` | `/api/extract/{id}` | Return the job status and, when done, the extracted fields and optional PDF preview data URL |
| `POST` | `/api/spreadsheet/save` | Save the submitted Syncfusion Spreadsheet workbook and return the generated file |

Extraction job statuses are `queued`, `processing`, `done`, and `failed`. Unknown or expired job IDs return `404`. The result contains `fields` (`key` and `value` pairs) and an optional `pdf` data URL for image uploads.

## Data handling and limitations

- Uploaded bytes, queued jobs, and extraction results are held in API process memory; they are not saved to a database or archive.
- The client keeps editable rows in browser state until the spreadsheet is saved.
- Restarting the API loses active and completed jobs. Completed jobs also expire from memory after 30 minutes.
- OCR output can require manual correction. Review the extracted values before using or exporting them.
- Do not upload sensitive documents to a publicly accessible deployment without adding appropriate authentication, authorization, privacy, retention, and operational controls.

## Licensing

Syncfusion components and server libraries are governed by Syncfusion's licensing terms. A valid Syncfusion license is required where applicable; review the [Syncfusion licensing documentation](https://www.syncfusion.com/sales/licensing) before redistributing or deploying this application.