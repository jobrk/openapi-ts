// This file is auto-generated by @hey-api/openapi-ts

/**
 * original name: 201
 */
export type _201 = number;

/**
 * original name: Foo
 */
export type foo = {
    /**
     * original name: fooBar
     */
    fooBar: fooBar;
    /**
     * original name: BarBaz
     */
    BarBaz: foo;
    /**
     * original name: qux_quux
     */
    qux_quux: {
        /**
         * original name: fooBar
         */
        fooBar: fooBar2;
        /**
         * original name: BarBaz
         */
        BarBaz: fooBar3;
        /**
         * original name: qux_quux
         */
        qux_quux: boolean;
    };
};

/**
 * original name: foo_bar
 */
export type fooBar = boolean;

/**
 * original name: fooBar
 */
export type fooBar2 = number;

/**
 * original name: FooBar
 */
export type fooBar3 = string;

export type getFooData = {
    body: foo;
    path?: never;
    query: {
        /**
         * original name: fooBar
         */
        fooBar: string;
        /**
         * original name: BarBaz
         */
        BarBaz: string;
        /**
         * original name: qux_quux
         */
        qux_quux: string;
    };
    url: '/foo';
};

export type getFooResponses = {
    /**
     * OK
     */
    200: foo;
    /**
     * OK
     */
    201: _201;
};

export type getFooResponse = getFooResponses[keyof getFooResponses];