import { Entities, FieldMetaData } from '@uipath/uipath-typescript/entities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@uipath/apollo-wind';
import { CustomCellEditorProps } from 'ag-grid-react';
import { JSX, useCallback, useEffect, useRef, useState } from "react";
import { useEntityRecordsCache } from '../hooks/useEntityRecordsCache';
import { GridRow } from '../types';

export interface RefFieldCellEditorProps extends CustomCellEditorProps {
  entityService: Entities;
  field: FieldMetaData;
  entityRecord: GridRow;
}

export const RefFieldCellEditor = ({ entityService, field, entityRecord, onValueChange }: RefFieldCellEditorProps) => {
  const [selectedValue, setSelectedValue] = useState(entityRecord[field.name]?.Id || 'none');
  const [selectItems, setSelectItems] = useState<JSX.Element[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const recordsMapRef = useRef<Map<string, GridRow>>(new Map());
  const { getRecords } = useEntityRecordsCache(entityService);

  const referenceFieldName = field.referenceField?.definition?.name || '';

  useEffect(() => {
    const fetchRecords = async () => {
      const fetchedRecords = await getRecords(field.referenceEntity?.id || '');
      recordsMapRef.current = new Map(fetchedRecords.map(r => [r.Id, r]));
      setSelectItems(
        fetchedRecords.map(record => (
          <SelectItem key={record.Id} value={record.Id}>
            {record[referenceFieldName]}
          </SelectItem>
        ))
      );
      setIsLoading(false);
      if (fetchedRecords.length > 0) setIsOpen(true);
    };
    fetchRecords();
  }, [field.referenceEntity?.id, getRecords, referenceFieldName]);

  const handleOnChange = useCallback((newValue: string) => {
    const selectedRecord = newValue !== 'none' ? recordsMapRef.current.get(newValue) : null;
    setSelectedValue(newValue);
    onValueChange(selectedRecord);
  }, [onValueChange]);

  return (
    <div className="h-full">
      <Select value={selectedValue} onValueChange={handleOnChange} disabled={isLoading} open={isOpen} onOpenChange={setIsOpen}>
        <SelectTrigger className="h-full w-full">
          <SelectValue>{isLoading ? 'Loading...' : undefined}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {selectItems}
        </SelectContent>
      </Select>
    </div>
  );
};
