const DEV_BYPASS_KEY = "ads_dev_auth_bypass";

export function isDevBypassEnabled() {
  return localStorage.getItem(DEV_BYPASS_KEY) === "true";
}

export function setDevBypassEnabled(enabled: boolean) {
  if (enabled) {
    localStorage.setItem(DEV_BYPASS_KEY, "true");
    return;
  }
  localStorage.removeItem(DEV_BYPASS_KEY);
}
