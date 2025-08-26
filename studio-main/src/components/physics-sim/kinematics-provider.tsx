
'use client';

import { useEffect } from 'react';
import React from 'react';
import { createKinematicsStore, KinematicsContext } from '@/stores/kinematics-store';

export function KinematicsProvider({ children }: { children: React.ReactNode }) {
    const store = createKinematicsStore();
    useEffect(() => {
        // Trigger initial plot calculation
        store.getState().setParams({});
    }, [store]);
    return <KinematicsContext.Provider value={store}>{children}</KinematicsContext.Provider>;
}
