// React entry point. Registers the Syncfusion license before any Syncfusion
// control renders, imports the Tailwind 3 theme bundle once (no
// control-level stylesheets layered on top), then mounts the app.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerLicense } from '@syncfusion/ej2-base';

// One stylesheet import covers every Syncfusion control in 35.1.37.
// Per factory/standards/app-source-baseline.md, "Syncfusion theme stylesheets",
// loading a control's own index.css on top of this bundle re-imports base
// styles and overrides them, so we import the bundle and only the bundle.
import '@syncfusion/ej2-tailwind3-theme/styles/tailwind3.css';

import './styles.css';
import { App } from './App';

const licenseKey = import.meta.env.VITE_SYNCFUSION_LICENSE_KEY;
if (licenseKey) registerLicense(licenseKey);

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Drop the static boot frame once React has rendered: the theme bundle has
// already arrived by the time the Syncfusion controls render, so the app
// below the frame is fully styled when we remove it.
queueMicrotask(() => {
  const boot = document.getElementById('app-boot');
  if (boot) boot.remove();
});
