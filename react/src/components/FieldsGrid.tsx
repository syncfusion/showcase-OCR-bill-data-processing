import { useCallback, useMemo, useRef } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Edit,
  Toolbar,
  Inject
} from '@syncfusion/ej2-react-grids';

export interface FieldRow {
  Id: number;
  Key: string;
  Value: string;
}

interface Props {
  rows: FieldRow[];
  height: string;
  onRowsChange: (rows: FieldRow[]) => void;
  isDarkMode?: boolean;
}

export function FieldsGrid({ rows, height, onRowsChange, isDarkMode = false }: Props) {
  const gridRef = useRef<GridComponent | null>(null);

  const dataSource = useMemo(() => rows.map((r) => ({ ...r })), [rows]);

  // The legacy HTML flipped between edits in place and the source-of-truth
  // on row changes. The React port reads the data from props on every render,
  // so the grid's source is always the latest snapshot.
  const handleChange = useCallback(
    (_state: unknown) => {
      if (!gridRef.current) return;
      const current = (gridRef.current.dataSource as FieldRow[]) ?? [];
      onRowsChange(current);
    },
    [onRowsChange]
  );

  return (
    <div className={isDarkMode ? 'e-dark-mode' : ''} style={{ height }}>
      <GridComponent
        id="grid"
        ref={gridRef as never}
        dataSource={dataSource}
        height="100%"
        editSettings={{ allowEditing: true, allowDeleting: true }}
        toolbar={['Edit', 'Delete', 'Update', 'Cancel']}
        actionBegin={handleChange}
        actionComplete={handleChange}
      >
        <ColumnsDirective>
          <ColumnDirective field="Id" isPrimaryKey visible={false} />
          <ColumnDirective field="Key" headerText="Field" width={180} />
          <ColumnDirective field="Value" headerText="Value" format="string" />
        </ColumnsDirective>
        <Inject services={[Edit, Toolbar]} />
      </GridComponent>
    </div>
  );
}
