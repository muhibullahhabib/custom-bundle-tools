import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import customBundleTools from './extensions/site/widgets/custom-bundle-tools/custom-bundle-tools.extension.ts';

export default app()
  .use(myPage).use(customBundleTools);
