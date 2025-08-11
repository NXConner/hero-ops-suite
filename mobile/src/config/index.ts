let API_BASE_URL = 'https://example.com/api';

export const CONFIG = {
  get API_BASE_URL() {
    return API_BASE_URL;
  },
};

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
}