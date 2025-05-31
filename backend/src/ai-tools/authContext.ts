import { AsyncLocalStorage } from 'async_hooks';

type AuthStore = { authToken: string };

export const asyncLocalStorage = new AsyncLocalStorage<AuthStore>();

export const setAuthContext = (authToken: string, fn: () => Promise<any>) => {
  return asyncLocalStorage.run({ authToken }, fn);
};

export const getCurrentAuthToken = () => {
  const store = asyncLocalStorage.getStore();
  if (!store?.authToken) {
    throw new Error("Auth token not set in context");
  }
  return store.authToken;
};