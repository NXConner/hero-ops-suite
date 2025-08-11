let API_BASE_URL = 'http://localhost:3001';

export const CONFIG = {
  get API_BASE_URL() {
    return API_BASE_URL;
  },
};

export function setApiBaseUrl(url: string) {
  API_BASE_URL = url;
}