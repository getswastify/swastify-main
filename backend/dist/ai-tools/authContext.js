"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentAuthToken = exports.setAuthContext = exports.asyncLocalStorage = void 0;
const async_hooks_1 = require("async_hooks");
exports.asyncLocalStorage = new async_hooks_1.AsyncLocalStorage();
const setAuthContext = (authToken, fn) => {
    return exports.asyncLocalStorage.run({ authToken }, fn);
};
exports.setAuthContext = setAuthContext;
const getCurrentAuthToken = () => {
    const store = exports.asyncLocalStorage.getStore();
    if (!(store === null || store === void 0 ? void 0 : store.authToken)) {
        throw new Error("Auth token not set in context");
    }
    return store.authToken;
};
exports.getCurrentAuthToken = getCurrentAuthToken;
