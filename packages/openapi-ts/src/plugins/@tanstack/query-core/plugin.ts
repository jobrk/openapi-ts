import ts from 'typescript';

import { compiler, type Property } from '../../../compiler';
import type { ImportExportItem } from '../../../compiler/module';
import {
  type ImportExportItemObject,
  tsNodeToString,
} from '../../../compiler/utils';
import { clientApi, clientModulePath } from '../../../generate/client';
import {
  hasOperationDataRequired,
  operationPagination,
} from '../../../ir/operation';
import type { IR } from '../../../ir/types';
import { getConfig } from '../../../utils/config';
import { getServiceName } from '../../../utils/postprocess';
import { transformServiceName } from '../../../utils/transform';
import { operationOptionsType } from '../../@hey-api/sdk/plugin';
import { serviceFunctionIdentifier } from '../../@hey-api/sdk/plugin-legacy';
import { schemaToType } from '../../@hey-api/typescript/plugin';
import { operationIrRef } from '../../shared/utils/ref';
import type { Plugin } from '../../types';
import type { Config as AngularQueryConfig } from '../angular-query-experimental';
import type { Config as ReactQueryConfig } from '../react-query';
import type { Config as SolidQueryConfig } from '../solid-query';
import type { Config as SvelteQueryConfig } from '../svelte-query';
import type { Config as VueQueryConfig } from '../vue-query';

type PluginInstance = Plugin.Instance<
  | AngularQueryConfig
  | ReactQueryConfig
  | SolidQueryConfig
  | SvelteQueryConfig
  | VueQueryConfig
>;

const infiniteQueryOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}InfiniteOptions`;

const mutationOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}Mutation`;

const queryOptionsFunctionIdentifier = ({
  context,
  operation,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}Options`;

const queryKeyFunctionIdentifier = ({
  context,
  isInfinite,
  operation,
}: {
  context: IR.Context;
  isInfinite?: boolean;
  operation: IR.OperationObject;
}) =>
  `${serviceFunctionIdentifier({
    config: context.config,
    id: operation.id,
    operation,
  })}${isInfinite ? 'Infinite' : ''}QueryKey`;

const createInfiniteParamsFn = 'createInfiniteParams';
const createQueryKeyFn = 'createQueryKey';
const infiniteQueryOptionsFn = 'infiniteQueryOptions';
const mutationOptionsFn = 'mutationOptions';
const queryKeyName = 'QueryKey';
const queryOptionsFn = 'queryOptions';
const TOptionsType = 'TOptions';

const getClientBaseUrlKey = () => {
  const config = getConfig();
  return config.client.name === '@hey-api/client-axios' ? 'baseURL' : 'baseUrl';
};

const createInfiniteParamsFunction = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const fn = compiler.constVariable({
    expression: compiler.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'queryKey',
          type: compiler.typeReferenceNode({
            typeName: `QueryKey<${clientApi.Options.name}>`,
          }),
        },
        {
          name: 'page',
          type: compiler.typeReferenceNode({ typeName: 'K' }),
        },
      ],
      statements: [
        compiler.constVariable({
          expression: compiler.identifier({
            text: 'queryKey[0]',
          }),
          name: 'params',
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'body' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'body',
                  }),
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].body',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.body',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'headers' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'headers',
                  }),
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        spread: 'queryKey[0].headers',
                      },
                      {
                        spread: 'page.headers',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'path' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'path',
                  }),
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].path',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.path',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({
              text: 'page',
            }),
            name: compiler.identifier({ text: 'query' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'query',
                  }),
                  right: compiler.objectExpression({
                    multiLine: true,
                    obj: [
                      {
                        assertion: 'any',
                        spread: 'queryKey[0].query',
                      },
                      {
                        assertion: 'any',
                        spread: 'page.query',
                      },
                    ],
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.returnVariable({
          expression: ts.factory.createAsExpression(
            ts.factory.createAsExpression(
              compiler.identifier({ text: 'params' }),
              ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ),
            ts.factory.createTypeQueryNode(
              compiler.identifier({ text: 'page' }),
            ),
          ),
        }),
      ],
      types: [
        {
          extends: compiler.typeReferenceNode({
            typeName: compiler.identifier({
              text: `Pick<QueryKey<${clientApi.Options.name}>[0], 'body' | 'headers' | 'path' | 'query'>`,
            }),
          }),
          name: 'K',
        },
      ],
    }),
    name: createInfiniteParamsFn,
  });
  file.add(fn);
};

const createQueryKeyFunction = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const returnType = compiler.indexedAccessTypeNode({
    indexType: compiler.literalTypeNode({
      literal: compiler.ots.number(0),
    }),
    objectType: compiler.typeReferenceNode({
      typeArguments: [compiler.typeReferenceNode({ typeName: TOptionsType })],
      typeName: queryKeyName,
    }),
  });

  const infiniteIdentifier = compiler.identifier({ text: 'infinite' });

  const identifierCreateQueryKey = file.identifier({
    $ref: `#/ir/${createQueryKeyFn}`,
    create: true,
    namespace: 'value',
  });

  const fn = compiler.constVariable({
    expression: compiler.arrowFunction({
      multiLine: true,
      parameters: [
        {
          name: 'id',
          type: compiler.typeReferenceNode({ typeName: 'string' }),
        },
        {
          name: 'path',
          type: compiler.typeReferenceNode({ typeName: 'string' }),
        },
        {
          isRequired: false,
          name: 'options',
          type: compiler.typeReferenceNode({ typeName: TOptionsType }),
        },
        {
          isRequired: false,
          name: 'infinite',
          type: compiler.typeReferenceNode({ typeName: 'boolean' }),
        },
      ],
      returnType,
      statements: [
        compiler.constVariable({
          assertion: returnType,
          expression: compiler.objectExpression({
            multiLine: false,
            obj: [
              {
                key: '_id',
                value: compiler.identifier({ text: 'id' }),
              },
              {
                key: '_rawPath',
                value: compiler.identifier({ text: 'path' }),
              },
              {
                key: getClientBaseUrlKey(),
                value: compiler.identifier({
                  text: `(options?.client ?? client).getConfig().${getClientBaseUrlKey()}`,
                }),
              },
            ],
          }),
          name: 'params',
          typeName: returnType,
        }),
        compiler.ifStatement({
          expression: infiniteIdentifier,
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: '_infinite',
                  }),
                  right: infiniteIdentifier,
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'body' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'body',
                  }),
                  right: compiler.propertyAccessExpression({
                    expression: 'options',
                    name: 'body',
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'headers' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'headers',
                  }),
                  right: compiler.propertyAccessExpression({
                    expression: 'options',
                    name: 'headers',
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'path' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'path',
                  }),
                  right: compiler.propertyAccessExpression({
                    expression: 'options',
                    name: 'path',
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.ifStatement({
          expression: compiler.propertyAccessExpression({
            expression: compiler.identifier({ text: 'options' }),
            isOptional: true,
            name: compiler.identifier({ text: 'query' }),
          }),
          thenStatement: compiler.block({
            statements: [
              compiler.expressionToStatement({
                expression: compiler.binaryExpression({
                  left: compiler.propertyAccessExpression({
                    expression: 'params',
                    name: 'query',
                  }),
                  right: compiler.propertyAccessExpression({
                    expression: 'options',
                    name: 'query',
                  }),
                }),
              }),
            ],
          }),
        }),
        compiler.returnVariable({
          expression: 'params',
        }),
      ],
      types: [
        {
          extends: compiler.typeReferenceNode({
            typeName: compiler.identifier({
              text: clientApi.Options.name,
            }),
          }),
          name: TOptionsType,
        },
      ],
    }),
    name: identifierCreateQueryKey.name || '',
  });
  file.add(fn);
};

const createQueryKeyType = ({
  context,
  plugin,
}: {
  context: IR.Context;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;

  const properties: Property[] = [
    {
      name: '_id',
      type: compiler.keywordTypeNode({
        keyword: 'string',
      }),
    },
    {
      isRequired: false,
      name: '_infinite',
      type: compiler.keywordTypeNode({
        keyword: 'boolean',
      }),
    },
    {
      name: '_rawPath',
      type: compiler.keywordTypeNode({
        keyword: 'string',
      }),
    },
  ];

  const queryKeyType = compiler.typeAliasDeclaration({
    name: queryKeyName,
    type: compiler.typeTupleNode({
      types: [
        compiler.typeIntersectionNode({
          types: [
            compiler.typeReferenceNode({
              typeName: `Pick<${TOptionsType}, '${getClientBaseUrlKey()}' | 'body' | 'headers' | 'path' | 'query'>`,
            }),
            compiler.typeInterfaceNode({
              properties,
              useLegacyResolution: true,
            }),
          ],
        }),
      ],
    }),
    typeParameters: [
      {
        extends: compiler.typeReferenceNode({
          typeName: compiler.identifier({
            text: clientApi.Options.name,
          }),
        }),
        name: TOptionsType,
      },
    ],
  });
  file.add(queryKeyType);
};

const createQueryKeyLiteral = ({
  context,
  id,
  isInfinite,
  path,
  plugin,
}: {
  context: IR.Context;
  id: string;
  isInfinite?: boolean;
  path: string;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;
  const identifierCreateQueryKey = file.identifier({
    $ref: `#/ir/${createQueryKeyFn}`,
    namespace: 'value',
  });
  const queryKeyLiteral = compiler.arrayLiteralExpression({
    elements: [
      compiler.callExpression({
        functionName: identifierCreateQueryKey.name || '',
        parameters: [
          compiler.ots.string(id),
          compiler.ots.string(path),
          'options',
          isInfinite ? compiler.ots.boolean(true) : undefined,
        ],
      }),
    ],
    multiLine: false,
  });
  return queryKeyLiteral;
};

const useTypeData = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const identifierData = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'data' }),
    namespace: 'type',
  });
  if (identifierData.name) {
    const file = context.file({ id: plugin.name })!;
    file.import({
      asType: true,
      module: context
        .file({ id: plugin.name })!
        .relativePathToFile({ context, id: 'types' }),
      name: identifierData.name,
    });
  }
  const typeData = operationOptionsType({
    importedType: identifierData.name,
  });
  return typeData;
};

const useTypeError = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const file = context.file({ id: plugin.name })!;
  const identifierError = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'error' }),
    namespace: 'type',
  });
  if (identifierError.name) {
    file.import({
      asType: true,
      module: context
        .file({ id: plugin.name })!
        .relativePathToFile({ context, id: 'types' }),
      name: identifierError.name,
    });
  }
  let typeError: ImportExportItemObject = {
    asType: true,
    name: identifierError.name || '',
  };
  if (!typeError.name) {
    typeError = file.import({
      asType: true,
      module: plugin.name,
      name: 'DefaultError',
    });
  }
  if (context.config.client.name === '@hey-api/client-axios') {
    const axiosError = file.import({
      asType: true,
      module: 'axios',
      name: 'AxiosError',
    });
    typeError = {
      ...axiosError,
      name: `${axiosError.name}<${typeError.name}>`,
    };
  }
  return typeError;
};

const useTypeResponse = ({
  context,
  operation,
  plugin,
}: {
  context: IR.Context;
  operation: IR.OperationObject;
  plugin: PluginInstance;
}) => {
  const identifierResponse = context.file({ id: 'types' })!.identifier({
    $ref: operationIrRef({ id: operation.id, type: 'response' }),
    namespace: 'type',
  });
  if (identifierResponse.name) {
    const file = context.file({ id: plugin.name })!;
    file.import({
      asType: true,
      module: context
        .file({ id: plugin.name })!
        .relativePathToFile({ context, id: 'types' }),
      name: identifierResponse.name,
    });
  }
  const typeResponse = identifierResponse.name || 'unknown';
  return typeResponse;
};

const queryKeyStatement = ({
  context,
  isInfinite,
  operation,
  plugin,
  typeQueryKey,
}: {
  context: IR.Context;
  isInfinite: boolean;
  operation: IR.OperationObject;
  plugin: PluginInstance;
  typeQueryKey?: string;
}) => {
  const file = context.file({ id: plugin.name })!;
  const typeData = useTypeData({ context, operation, plugin });
  const name = queryKeyFunctionIdentifier({
    context,
    isInfinite,
    operation,
  });
  const identifierQueryKey = file.identifier({
    $ref: `#/queryKey/${name}`,
    create: true,
    namespace: 'value',
  });
  const statement = compiler.constVariable({
    exportConst: true,
    expression: compiler.arrowFunction({
      parameters: [
        {
          isRequired: hasOperationDataRequired(operation),
          name: 'options',
          type: typeData,
        },
      ],
      returnType: isInfinite ? typeQueryKey : undefined,
      statements: createQueryKeyLiteral({
        context,
        id: operation.id,
        isInfinite,
        path: operation.path,
        plugin,
      }),
    }),
    name: identifierQueryKey.name || '',
  });
  return statement;
};

export const handler: Plugin.Handler<
  | ReactQueryConfig
  | AngularQueryConfig
  | SolidQueryConfig
  | SvelteQueryConfig
  | VueQueryConfig
> = ({ context, plugin }) => {
  const file = context.createFile({
    exportFromIndex: plugin.exportFromIndex,
    id: plugin.name,
    path: plugin.output,
  });

  file.import({
    ...clientApi.Options,
    module: clientModulePath({
      config: context.config,
      sourceOutput: plugin.output,
    }),
  });

  const mutationsType =
    plugin.name === '@tanstack/angular-query-experimental' ||
    plugin.name === '@tanstack/svelte-query' ||
    plugin.name === '@tanstack/solid-query'
      ? 'MutationOptions'
      : 'UseMutationOptions';

  let typeInfiniteData!: ImportExportItem;
  let hasCreateInfiniteParamsFunction = false;
  let hasCreateQueryKeyParamsFunction = false;
  let hasInfiniteQueries = false;
  let hasMutations = false;
  let hasQueries = false;

  context.subscribe('operation', ({ operation }) => {
    const queryFn = [
      context.config.plugins['@hey-api/sdk']?.asClass &&
        transformServiceName({
          config: context.config,
          name: getServiceName(operation.tags?.[0] || 'default'),
        }),
      serviceFunctionIdentifier({
        config: context.config,
        handleIllegal: !context.config.plugins['@hey-api/sdk']?.asClass,
        id: operation.id,
        operation,
      }),
    ]
      .filter(Boolean)
      .join('.');
    let hasUsedQueryFn = false;

    const isRequired = hasOperationDataRequired(operation);

    // queries
    if (
      plugin.queryOptions &&
      (['get', 'post'] as (typeof operation.method)[]).includes(
        operation.method,
      )
    ) {
      if (!hasQueries) {
        hasQueries = true;

        if (!hasCreateQueryKeyParamsFunction) {
          createQueryKeyType({ context, plugin });
          createQueryKeyFunction({ context, plugin });
          hasCreateQueryKeyParamsFunction = true;
        }

        file.import({
          module: plugin.name,
          name: queryOptionsFn,
        });
      }

      hasUsedQueryFn = true;

      const node = queryKeyStatement({
        context,
        isInfinite: false,
        operation,
        plugin,
      });
      file.add(node);

      const typeData = useTypeData({ context, operation, plugin });

      const queryKeyName = queryKeyFunctionIdentifier({
        context,
        isInfinite: false,
        operation,
      });
      const identifierQueryKey = file.identifier({
        $ref: `#/queryKey/${queryKeyName}`,
        namespace: 'value',
      });

      const statement = compiler.constVariable({
        // TODO: describe options, same as the actual function call
        comment: [],
        exportConst: true,
        expression: compiler.arrowFunction({
          parameters: [
            {
              isRequired,
              name: 'options',
              type: typeData,
            },
          ],
          statements: [
            compiler.returnFunctionCall({
              args: [
                compiler.objectExpression({
                  obj: [
                    {
                      key: 'queryFn',
                      value: compiler.arrowFunction({
                        async: true,
                        multiLine: true,
                        parameters: [
                          {
                            destructure: [
                              {
                                name: 'queryKey',
                              },
                              {
                                name: 'signal',
                              },
                            ],
                          },
                        ],
                        statements: [
                          compiler.constVariable({
                            destructure: true,
                            expression: compiler.awaitExpression({
                              expression: compiler.callExpression({
                                functionName: queryFn,
                                parameters: [
                                  compiler.objectExpression({
                                    multiLine: true,
                                    obj: [
                                      {
                                        spread: 'options',
                                      },
                                      {
                                        spread: 'queryKey[0]',
                                      },
                                      {
                                        key: 'signal',
                                        shorthand: true,
                                        value: compiler.identifier({
                                          text: 'signal',
                                        }),
                                      },
                                      {
                                        key: 'throwOnError',
                                        value: true,
                                      },
                                    ],
                                  }),
                                ],
                              }),
                            }),
                            name: 'data',
                          }),
                          compiler.returnVariable({
                            expression: 'data',
                          }),
                        ],
                      }),
                    },
                    {
                      key: 'queryKey',
                      value: compiler.callExpression({
                        functionName: identifierQueryKey.name || '',
                        parameters: ['options'],
                      }),
                    },
                  ],
                }),
              ],
              name: queryOptionsFn,
            }),
          ],
        }),
        name: queryOptionsFunctionIdentifier({ context, operation }),
        // TODO: add type error
        // TODO: AxiosError<PutSubmissionMetaError>
      });
      file.add(statement);
    }

    // infinite queries
    if (
      plugin.infiniteQueryOptions &&
      (['get', 'post'] as (typeof operation.method)[]).includes(
        operation.method,
      )
    ) {
      const pagination = operationPagination({ context, operation });

      if (pagination) {
        if (!hasInfiniteQueries) {
          hasInfiniteQueries = true;

          if (!hasCreateQueryKeyParamsFunction) {
            createQueryKeyType({ context, plugin });
            createQueryKeyFunction({ context, plugin });
            hasCreateQueryKeyParamsFunction = true;
          }

          if (!hasCreateInfiniteParamsFunction) {
            createInfiniteParamsFunction({ context, plugin });
            hasCreateInfiniteParamsFunction = true;
          }

          file.import({
            module: plugin.name,
            name: infiniteQueryOptionsFn,
          });

          typeInfiniteData = file.import({
            asType: true,
            module: plugin.name,
            name: 'InfiniteData',
          });
        }

        hasUsedQueryFn = true;

        const typeData = useTypeData({ context, operation, plugin });
        const typeError = useTypeError({ context, operation, plugin });
        const typeResponse = useTypeResponse({ context, operation, plugin });

        const typeQueryKey = `${queryKeyName}<${typeData}>`;
        const typePageObjectParam = `Pick<${typeQueryKey}[0], 'body' | 'headers' | 'path' | 'query'>`;
        // TODO: parser - this is a bit clunky, need to compile type to string because
        // `compiler.returnFunctionCall()` accepts only strings, should be cleaned up
        const typePageParam = `${tsNodeToString({
          node: schemaToType({
            context,
            plugin: context.config.plugins['@hey-api/typescript'] as Parameters<
              typeof schemaToType
            >[0]['plugin'],
            schema: pagination.schema,
          }),
          unescape: true,
        })} | ${typePageObjectParam}`;

        const node = queryKeyStatement({
          context,
          isInfinite: true,
          operation,
          plugin,
          typeQueryKey,
        });
        file.add(node);

        const infiniteQueryKeyName = queryKeyFunctionIdentifier({
          context,
          isInfinite: true,
          operation,
        });
        const identifierQueryKey = file.identifier({
          $ref: `#/queryKey/${infiniteQueryKeyName}`,
          namespace: 'value',
        });

        const statement = compiler.constVariable({
          // TODO: describe options, same as the actual function call
          comment: [],
          exportConst: true,
          expression: compiler.arrowFunction({
            parameters: [
              {
                isRequired,
                name: 'options',
                type: typeData,
              },
            ],
            statements: [
              compiler.returnFunctionCall({
                args: [
                  compiler.objectExpression({
                    comments: [
                      {
                        jsdoc: false,
                        lines: ['@ts-ignore'],
                      },
                    ],
                    obj: [
                      {
                        key: 'queryFn',
                        value: compiler.arrowFunction({
                          async: true,
                          multiLine: true,
                          parameters: [
                            {
                              destructure: [
                                {
                                  name: 'pageParam',
                                },
                                {
                                  name: 'queryKey',
                                },
                                {
                                  name: 'signal',
                                },
                              ],
                            },
                          ],
                          statements: [
                            compiler.constVariable({
                              comment: [
                                {
                                  jsdoc: false,
                                  lines: ['@ts-ignore'],
                                },
                              ],
                              expression: compiler.conditionalExpression({
                                condition: compiler.binaryExpression({
                                  left: compiler.typeOfExpression({
                                    text: 'pageParam',
                                  }),
                                  operator: '===',
                                  right: compiler.ots.string('object'),
                                }),
                                whenFalse: compiler.objectExpression({
                                  multiLine: true,
                                  obj: [
                                    {
                                      key: pagination.in,
                                      value: compiler.objectExpression({
                                        multiLine: true,
                                        obj: [
                                          {
                                            key: pagination.name,
                                            value: compiler.identifier({
                                              text: 'pageParam',
                                            }),
                                          },
                                        ],
                                      }),
                                    },
                                  ],
                                }),
                                whenTrue: compiler.identifier({
                                  text: 'pageParam',
                                }),
                              }),
                              name: 'page',
                              typeName: typePageObjectParam,
                            }),
                            compiler.constVariable({
                              expression: compiler.callExpression({
                                functionName: createInfiniteParamsFn,
                                parameters: ['queryKey', 'page'],
                              }),
                              name: 'params',
                            }),
                            compiler.constVariable({
                              destructure: true,
                              expression: compiler.awaitExpression({
                                expression: compiler.callExpression({
                                  functionName: queryFn,
                                  parameters: [
                                    compiler.objectExpression({
                                      multiLine: true,
                                      obj: [
                                        {
                                          spread: 'options',
                                        },
                                        {
                                          spread: 'params',
                                        },
                                        {
                                          key: 'signal',
                                          shorthand: true,
                                          value: compiler.identifier({
                                            text: 'signal',
                                          }),
                                        },
                                        {
                                          key: 'throwOnError',
                                          value: true,
                                        },
                                      ],
                                    }),
                                  ],
                                }),
                              }),
                              name: 'data',
                            }),
                            compiler.returnVariable({
                              expression: 'data',
                            }),
                          ],
                        }),
                      },
                      {
                        key: 'queryKey',
                        value: compiler.callExpression({
                          functionName: identifierQueryKey.name || '',
                          parameters: ['options'],
                        }),
                      },
                    ],
                  }),
                ],
                name: infiniteQueryOptionsFn,
                // TODO: better types syntax
                types: [
                  typeResponse,
                  typeError.name,
                  `${typeof typeInfiniteData === 'string' ? typeInfiniteData : typeInfiniteData.name}<${typeResponse}>`,
                  typeQueryKey,
                  typePageParam,
                ],
              }),
            ],
          }),
          name: infiniteQueryOptionsFunctionIdentifier({
            context,
            operation,
          }),
        });
        file.add(statement);
      }
    }

    // mutations
    if (
      plugin.mutationOptions &&
      (
        ['delete', 'patch', 'post', 'put'] as (typeof operation.method)[]
      ).includes(operation.method)
    ) {
      if (!hasMutations) {
        hasMutations = true;

        file.import({
          asType: true,
          module: plugin.name,
          name: mutationsType,
        });
      }

      hasUsedQueryFn = true;

      const typeData = useTypeData({ context, operation, plugin });
      const typeError = useTypeError({ context, operation, plugin });
      const typeResponse = useTypeResponse({ context, operation, plugin });

      const expression = compiler.arrowFunction({
        parameters: [
          {
            isRequired: false,
            name: 'options',
            type: `Partial<${typeData}>`,
          },
        ],
        statements: [
          compiler.constVariable({
            expression: compiler.objectExpression({
              obj: [
                {
                  key: 'mutationFn',
                  value: compiler.arrowFunction({
                    async: true,
                    multiLine: true,
                    parameters: [
                      {
                        name: 'localOptions',
                      },
                    ],
                    statements: [
                      compiler.constVariable({
                        destructure: true,
                        expression: compiler.awaitExpression({
                          expression: compiler.callExpression({
                            functionName: queryFn,
                            parameters: [
                              compiler.objectExpression({
                                multiLine: true,
                                obj: [
                                  {
                                    spread: 'options',
                                  },
                                  {
                                    spread: 'localOptions',
                                  },
                                  {
                                    key: 'throwOnError',
                                    value: true,
                                  },
                                ],
                              }),
                            ],
                          }),
                        }),
                        name: 'data',
                      }),
                      compiler.returnVariable({
                        expression: 'data',
                      }),
                    ],
                  }),
                },
              ],
            }),
            name: mutationOptionsFn,
            // TODO: better types syntax
            typeName: `${mutationsType}<${typeResponse}, ${typeError.name}, ${typeData}>`,
          }),
          compiler.returnVariable({
            expression: mutationOptionsFn,
          }),
        ],
      });
      const statement = compiler.constVariable({
        // TODO: describe options, same as the actual function call
        comment: [],
        exportConst: true,
        expression,
        name: mutationOptionsFunctionIdentifier({ context, operation }),
      });
      file.add(statement);
    }

    if (hasQueries || hasInfiniteQueries) {
      file.import({
        module: context
          .file({ id: plugin.name })!
          .relativePathToFile({ context, id: 'sdk' }),
        name: 'client',
      });
    }

    if (hasUsedQueryFn) {
      file.import({
        module: context
          .file({ id: plugin.name })!
          .relativePathToFile({ context, id: 'sdk' }),
        name: queryFn.split('.')[0]!,
      });
    }
  });
};
