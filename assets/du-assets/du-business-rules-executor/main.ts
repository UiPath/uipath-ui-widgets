// Licensed to the .NET Foundation under one or more agreements.
// The .NET Foundation licenses this file to you under the MIT license.

import { AssetBehaviors } from './dotnet.js';
import { WasmExports } from './models';

export const init = async (cdnUrl?: string): Promise<WasmExports> => {
    const dotnetLib = await import(/* webpackIgnore: true */'./dotnet.js');
    const { getAssemblyExports, getConfig } = await dotnetLib.dotnet
        .withDiagnosticTracing(false)
        .withResourceLoader((type: any, name: string, defaultUri: string, _integrity: string, _behavior: AssetBehaviors) => {
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

    return await getAssemblyExports(config.mainAssemblyName);
}