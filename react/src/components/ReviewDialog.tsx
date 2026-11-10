import { useEffect, useRef, useState } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { ColumnDirective, ColumnsDirective, SpreadsheetComponent } from '@syncfusion/ej2-react-spreadsheet';
import { apiUrl } from '../lib/apiBasePath';

interface FieldRow {
  Id: number;
  Key: string;
  Value: string;
}

interface Props {
  rows: FieldRow[];
  open: boolean;
  onClose: () => void;
}

interface SpreadsheetSheetRow {
  Field: string;
  Value: string;
}

// Spreadsheet is heavy (factory/standards/app-source-baseline.md, "Loading
// states"); it lives in its own chunk via the Vite manualChunks config in
// vite.config.ts. The legacy script (line 218) created the Spreadsheet
// imperatively on the dialog's open event and destroyed it on close; the
// React port keeps the same lifecycle by rendering the Spreadsheet only
// while the dialog is open and unmounting it on close.
export function ReviewDialog({ rows, open, onClose }: Props) {
  const spreadsheetRef = useRef<SpreadsheetComponent | null>(null);
  // Track the rows the Spreadsheet was last rendered with; remount only when
  // they actually change between openings so cancel edits inside the dialog
  // do not lose their work.
  const [sheetRows, setSheetRows] = useState<SpreadsheetSheetRow[]>(() =>
    rows.map((r) => ({ Field: r.Key, Value: r.Value }))
  );

  useEffect(() => {
    if (!open) return;
    setSheetRows(rows.map((r) => ({ Field: r.Key, Value: r.Value })));
  }, [open, rows]);

  return (
    <DialogComponent
      id="review-dialog"
      header="Review & save"
      isModal
      visible={open}
      showCloseIcon
      width="96%"
      height="92%"
      target={document.body}
      closeOnEscape
      close={() => {
        // Match the legacy close handler: destroy the Spreadsheet so the next
        // open is a fresh instance.
        spreadsheetRef.current?.destroy();
        spreadsheetRef.current = null;
        onClose();
      }}
    >
        <SpreadsheetComponent
          id="spreadsheet"
          ref={spreadsheetRef as never}
          height="100%"
          saveUrl={apiUrl('/api/spreadsheet/save')}
          sheets={[{ name: 'Extracted Data', ranges: [{ dataSource: sheetRows }] }]}
      >
        {/* <ColumnsDirective>
            <ColumnDirective width={180}></ColumnDirective>
            <ColumnDirective width={200}></ColumnDirective>
        </ColumnsDirective> */}
        </SpreadsheetComponent>
    </DialogComponent>
  );
}
