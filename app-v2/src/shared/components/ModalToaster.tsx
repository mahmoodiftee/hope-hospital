import React, { useEffect } from 'react';
import { Toaster } from 'sonner-native';
import { reclaimRootToaster } from '@/shared/utils/toastReclaim';

/**
 * Toaster for use inside RN Modals so toasts appear above the sheet.
 * On unmount, notifies the root Toaster to reclaim global toast handlers.
 */
export function ModalToaster() {
    useEffect(() => {
        return () => {
            reclaimRootToaster();
        };
    }, []);

    return <Toaster />;
}
