import { DeviceEventEmitter } from 'react-native';

export const TOAST_RECLAIM_EVENT = 'hopehospital.toast.reclaim';

/** Call when a modal-scoped Toaster unmounts so the root Toaster can reclaim handlers. */
export function reclaimRootToaster() {
    DeviceEventEmitter.emit(TOAST_RECLAIM_EVENT);
}
