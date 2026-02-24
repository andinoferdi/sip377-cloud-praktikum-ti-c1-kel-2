export type POSInstanceType = "TABLE_SERVICE" | "TAB_SERVICE";

export type POSInstanceResponse = {
  id: string;
  name: string;
  type: POSInstanceType;
  totalTable: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tableLabels?: TableLabelResponse[];
};

export type TableLabelResponse = {
  id: string;
  posInstanceId: string;
  position: number;
  label: string;
  createdAt: string;
  updatedAt: string;
};

export type CreatePOSInstancePayload = {
  name: string;
  type: "TABLE_SERVICE" | "TAB_SERVICE";
  totalTable?: number;
};

export type UpdatePOSInstancePayload = {
  name?: string;
  totalTable?: number;
  isActive?: boolean;
};

export type UpdateTableLabelPayload = {
  label: string;
};
