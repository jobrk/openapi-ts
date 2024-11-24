// This file is auto-generated by @hey-api/openapi-ts

import { createClient, createConfig, type OptionsLegacyParser, formDataBodySerializer } from '@hey-api/client-fetch';
import type { PostV1FooData, PostV1FooError, PostV1FooResponse } from './types.gen';

export const client = createClient(createConfig());

export const postV1Foo = <ThrowOnError extends boolean = false>(options: OptionsLegacyParser<PostV1FooData, ThrowOnError>) => {
    return (options?.client ?? client).post<PostV1FooResponse, PostV1FooError, ThrowOnError>({
        ...options,
        ...formDataBodySerializer,
        headers: {
            'Content-Type': null,
            ...options?.headers
        },
        url: '/v1/foo'
    });
};