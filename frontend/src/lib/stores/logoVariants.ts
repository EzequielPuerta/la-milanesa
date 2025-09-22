import { createThemeLogoSrc } from './dynamicLogo';

export const logoSmall = createThemeLogoSrc((isDark) =>
    isDark
        ? '/logos/light-logo-transparency-64x64.png'
        : '/logos/dark-logo-transparency-64x64.png'
);

export const logoLarge = createThemeLogoSrc((isDark) =>
isDark
        ? '/logos/light-logo-transparency.png'
        : '/logos/dark-logo-transparency.png'
);
