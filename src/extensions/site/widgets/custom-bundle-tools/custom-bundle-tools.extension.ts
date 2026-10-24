import { extensions } from '@wix/astro/builders'

export default extensions.customElement({
  id: '673575e0-ba63-4451-b533-865e4b64a54c',
  name: 'Custom Bundle Tools',
  width: { defaultWidth: 1200, allowStretch: true },
  height: { defaultHeight: 900 },
  installation: { autoAdd: true },
  presets: [
    {
      id: '1db5391b-f82e-43a0-89a8-fd69c24fb1b2',
      name: 'default',
      thumbnailUrl: '{{BASE_URL}}/custom-bundle-tools-thumbnail.png',
    },
  ],
  tagName: 'custom-bundle-tools',
  element: './extensions/site/widgets/custom-bundle-tools/custom-bundle-tools.tsx',
  settings: './extensions/site/widgets/custom-bundle-tools/custom-bundle-tools.panel.tsx',
});