/* eslint-disable @typescript-eslint/no-explicit-any */
import { getFieldValue } from "../utils/fieldUtils";
import { EntityGetResponse } from "@uipath/uipath-typescript";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@uipath/apollo-wind";
import { useMemo } from "react";

interface DiffDialogProps {
  entity: EntityGetResponse | undefined;
  isOpen: boolean;
  onClose: () => void;
  onCommit: () => void;
  onRevertAll: () => void;
  onRevertField: (rowId: string, fieldKey: string, originalValue: any) => void;
  diffData: Array<{
    rowId: string;
    original: any;
    edited: any;
  }>;
}

// Helper function to safely convert any value to a displayable string
const valueToString = (value: any): string => {
  if (value === null || value === undefined) {
    return String(value);
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
};

export const DiffDialog = ({
  entity,
  isOpen,
  onClose,
  onCommit,
  onRevertAll,
  onRevertField,
  diffData,
}: DiffDialogProps) => {
  const fieldsMap = useMemo(() => {
    return new Map(entity?.fields.map((f) => [f.name, f]) || []);
  }, [entity]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Changes</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {diffData.map(({ rowId, original, edited }) => (
            <div key={rowId} className="space-y-2">
              <h3 className="text-sm font-medium">Row ID: {rowId}</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="h-8">Field</TableHead>
                      <TableHead className="h-8">Original</TableHead>
                      <TableHead className="h-8">New</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(edited).map((key) => {
                      const originalValue = original?.[key];
                      const editedValue = edited[key];
                      const hasChanged =
                        JSON.stringify(originalValue) !==
                        JSON.stringify(editedValue);
                      const field = fieldsMap.get(key);

                      return hasChanged ? (
                        <TableRow key={key} className="hover:bg-muted/50">
                          <TableCell className="py-2 font-medium">
                            {key}
                          </TableCell>
                          <TableCell className="py-2 text-muted-foreground">
                            {field
                              ? getFieldValue(originalValue, field)
                              : valueToString(originalValue)}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {field
                                  ? getFieldValue(editedValue, field)
                                  : valueToString(editedValue)}
                              </span>
                              <Button
                                onClick={() =>
                                  onRevertField(rowId, key, originalValue)
                                }
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Revert this field"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  height="16px"
                                  viewBox="0 -960 960 960"
                                  width="16px"
                                  fill="currentColor"
                                >
                                  <path d="M280-200v-80h284q63 0 109.5-40T720-420q0-60-46.5-100T564-560H312l104 104-56 56-200-200 200-200 56 56-104 104h252q97 0 166.5 63T800-420q0 94-69.5 157T564-200H280Z" />
                                </svg>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : null;
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={onRevertAll} variant="outline">
            Revert
          </Button>
          <Button onClick={onCommit}>Commit Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
