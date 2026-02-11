'use client';

import { Suspense } from 'react';
import BuscadorPrincipalContent from './BuscadorPrincipalContent';

const BuscadorPrincipal = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <BuscadorPrincipalContent />
    </Suspense>
);

export default BuscadorPrincipal;
