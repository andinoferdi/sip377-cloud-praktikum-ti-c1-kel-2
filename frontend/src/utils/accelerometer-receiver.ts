export type ReceiverBindingState = {
  draftDeviceId: string;
  activeDeviceId: string;
};

export function createInitialReceiverBindingState(): ReceiverBindingState {
  return {
    draftDeviceId: "",
    activeDeviceId: "",
  };
}

export function applyReceiverDeviceSelection(draftDeviceId: string) {
  return draftDeviceId.trim();
}
