// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export const init = (cdnUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const dotnetLib = yield import(/* webpackIgnore: true */ './dotnet.js');
    const { getAssemblyExports, getConfig } = yield dotnetLib.dotnet
        .withDiagnosticTracing(false)
        .withResourceLoader((type, name, defaultUri, _integrity, _behavior) => {
        /**
         * When du-business-rules-executor is consumed directly from the CDN, loading the blazor.boot.json throws CORS error
         * because lib performs request with credentials: 'include' and CDN has Allow origin set to '*'.
         * We can bypass this by setting credentials to 'omit' in the request.
         * See more: https://github.com/dotnet/aspnetcore/issues/40348
         */
        if (!cdnUrl) {
            return defaultUri;
        }
        const resourceUrl = [cdnUrl, name].join('/');
        switch (type) {
            case 'dotnetjs':
                return resourceUrl;
            default:
                return fetch(resourceUrl, { credentials: 'omit' });
        }
    })
        .create();
    const config = getConfig();
    if (!config.mainAssemblyName) {
        throw new Error('mainAssemblyName cannot be undefined!');
    }
    return yield getAssemblyExports(config.mainAssemblyName);
});
//# sourceMappingURL=main.js.map