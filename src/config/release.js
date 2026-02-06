// Single source of truth for the app release version.
// NOTE: Save schema versioning is handled separately in GamePersistence.SAVE_VERSION.
export const APP_VERSION = '5.2.0';

const releaseModeFlag = import.meta.env?.VITE_RELEASE_MODE;
export const APP_RELEASE_MODE = releaseModeFlag === 'true' || import.meta.env?.PROD === true;

export const isReleaseMode = () => APP_RELEASE_MODE;
export const isDevelopmentMode = () => !APP_RELEASE_MODE;
export const getReleaseModeLabel = () => (APP_RELEASE_MODE ? 'release' : 'development');
export const shouldShowDebugTools = () => !APP_RELEASE_MODE;
