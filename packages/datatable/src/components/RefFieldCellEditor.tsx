import { GridRow } from '@uipath/datatable/types';
import { FieldMetaData, UiPath } from "@uipath/uipath-typescript";
import { CustomCellEditorProps } from 'ag-grid-react';
import { ChangeEvent, JSX, useEffect, useRef, useState } from "react";
import "./RefFieldCellEditor.scss";

export interface RefFieldCellEditorProps extends CustomCellEditorProps {
  sdk: UiPath;
  field: FieldMetaData;
  entityRecord: GridRow;
}

export const RefFieldCellEditor = ({ sdk, field, entityRecord, onValueChange }: RefFieldCellEditorProps) => {
  const [selectedValue, setSelectedValue] = useState<string>(entityRecord[field.name]?.Id);
  const [fieldOptions, setFieldOptions] = useState<JSX.Element[]>([]);
  const selectElementRef = useRef<HTMLSelectElement>(null);
  const hasFetchedRef = useRef(false);
  const recordsMapRef = useRef<Map<string, GridRow>>(new Map());

  const referenceEntityId = field.referenceEntity?.id;
  const referenceFieldName = field.referenceField?.definition?.name;

  useEffect(() => {
    if (hasFetchedRef.current) return;

    const fetchRecords = async () => {
      hasFetchedRef.current = true;
      const records = await sdk.entities.getRecordsById(referenceEntityId || '');

      // Build Map for fast lookups
      recordsMapRef.current = new Map(
        records.items.map(r => [r.Id, r])
      );

      setFieldOptions(records.items.map((r) => {
        const displayName = r[referenceFieldName || ''];
        return <option key={r.Id} value={r.Id}>{displayName}</option>
      }));
    }

    fetchRecords();
  }, [referenceEntityId, referenceFieldName, sdk]);

  useEffect(() => {
    if (fieldOptions.length > 0 && selectElementRef.current) {
      try {
        selectElementRef.current.focus();
        selectElementRef.current.showPicker();
      } catch {
        // Ignore error in case browser doesnt support opening the select picker
      }
    }
  }, [fieldOptions]);

  const handleOnChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const selectedRecord = newValue ? recordsMapRef.current.get(newValue) : null;
    setSelectedValue(newValue);
    onValueChange(selectedRecord);
  };

  return (
    <div className="relationship-field-editor">
      <select
        ref={selectElementRef}
        id="datatable-relationship-field-editor"
        className="relationship-field-editor__select"
        value={selectedValue}
        onChange={handleOnChange}
        disabled={!fieldOptions.length}
      >
        <option value=''>{fieldOptions.length ? 'None' : 'Loading...'}</option>
        {fieldOptions}
      </select>
    </div>
  )
};
