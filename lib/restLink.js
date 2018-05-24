var __extends =
  (this && this.__extends) ||
  (function() {
    var extendStatics =
      Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array &&
        function(d, b) {
          d.__proto__ = b;
        }) ||
      function(d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
      };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
var __assign =
  (this && this.__assign) ||
  Object.assign ||
  function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function() {
          return this;
        }),
      g
    );
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t = y[op[0] & 2 ? 'return' : op[0] ? 'throw' : 'next']) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [0, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
var _this = this;
import { ApolloLink, Observable } from 'apollo-link';
import {
  hasDirectives,
  getMainDefinition,
  getFragmentDefinitions,
  createFragmentMap,
  addTypenameToDocument,
  isField,
  isInlineFragment,
  resultKeyNameFromField,
} from 'apollo-utilities';
import { graphql } from 'graphql-anywhere/lib/async';
var popOneSetOfArrayBracketsFromTypeName = function(typename) {
  var noSpace = typename.replace(/\s/g, '');
  var sansOneBracketPair = noSpace.replace(/\[(.*)\]/, function(
    str,
    matchStr,
    offset,
    fullStr,
  ) {
    return (
      ((matchStr != null && matchStr.length) > 0 ? matchStr : null) || noSpace
    );
  });
  return sansOneBracketPair;
};
var addTypeNameToResult = function(result, __typename, typePatcher) {
  if (Array.isArray(result)) {
    var fixedTypename_1 = popOneSetOfArrayBracketsFromTypeName(__typename);
    // Recursion needed for multi-dimensional arrays
    return result.map(function(e) {
      return addTypeNameToResult(e, fixedTypename_1, typePatcher);
    });
  }
  return typePatcher(result, __typename, typePatcher);
};
var quickFindRestDirective = function(field) {
  if (field.directives && field.directives.length) {
    return field.directives.find(function(directive) {
      return 'rest' === directive.name.value;
    });
  }
  return null;
};
/**
 * The way graphql works today, it doesn't hand us the AST tree for our query, it hands us the ROOT
 * This method searches for REST-directive-attached nodes that are named to match this query.
 *
 * A little bit of wasted compute, but alternative would be a patch in graphql-anywhere.
 *
 * @param resultKey SearchKey for REST directive-attached item matching this sub-query
 * @param current current node in the REST-JSON-response
 * @param mainDefinition Parsed Query Definition
 * @param fragmentMap Map of Named Fragments
 * @param currentSelectionSet Current selection set we're filtering by
 */
function findRestDirectivesThenInsertNullsForOmittedFields(
  resultKey,
  current, // currentSelectionSet starts at root, so wait until we're inside a Field tagged with an @rest directive to activate!
  mainDefinition,
  fragmentMap,
  currentSelectionSet,
) {
  if (current == null || currentSelectionSet == null) {
    return current;
  }
  currentSelectionSet.selections.forEach(function(node) {
    if (isInlineFragment(node)) {
      findRestDirectivesThenInsertNullsForOmittedFields(
        resultKey,
        current,
        mainDefinition,
        fragmentMap,
        node.selectionSet,
      );
    } else if (node.kind === 'FragmentSpread') {
      var fragment = fragmentMap[node.name.value];
      findRestDirectivesThenInsertNullsForOmittedFields(
        resultKey,
        current,
        mainDefinition,
        fragmentMap,
        fragment.selectionSet,
      );
    } else if (isField(node)) {
      var name_1 = resultKeyNameFromField(node);
      if (name_1 === resultKey && quickFindRestDirective(node) != null) {
        // Jackpot! We found our selectionSet!
        insertNullsForAnyOmittedFields(
          current,
          mainDefinition,
          fragmentMap,
          node.selectionSet,
        );
      } else {
        findRestDirectivesThenInsertNullsForOmittedFields(
          resultKey,
          current,
          mainDefinition,
          fragmentMap,
          node.selectionSet,
        );
      }
    } else {
      // This will give a TypeScript build-time error if you did something wrong or the AST changes!
      return (function(node) {
        throw new Error('Unhandled Node Type in SelectionSetNode.selections');
      })(node);
    }
  });
  // Return current to have our result pass to next link in async promise chain!
  return current;
}
/**
 * Recursively walks a handed object in parallel with the Query SelectionSet,
 *  and inserts `null` for any field that is missing from the response.
 *
 * This is needed because ApolloClient will throw an error automatically if it's
 *  missing -- effectively making all of rest-link's selections implicitly non-optional.
 *
 * If you want to implement required fields, you need to use typePatcher to *delete*
 *  fields when they're null and you want the query to fail instead.
 *
 * @param current Current object we're patching
 * @param mainDefinition Parsed Query Definition
 * @param fragmentMap Map of Named Fragments
 * @param currentSelectionSet Current selection set we're filtering by
 */
function insertNullsForAnyOmittedFields(
  current, // currentSelectionSet starts at root, so wait until we're inside a Field tagged with an @rest directive to activate!
  mainDefinition,
  fragmentMap,
  currentSelectionSet,
) {
  if (current == null || currentSelectionSet == null) {
    return;
  }
  if (Array.isArray(current)) {
    // If our current value is an array, process our selection set for each entry.
    current.forEach(function(c) {
      return insertNullsForAnyOmittedFields(
        c,
        mainDefinition,
        fragmentMap,
        currentSelectionSet,
      );
    });
    return;
  }
  currentSelectionSet.selections.forEach(function(node) {
    if (isInlineFragment(node)) {
      insertNullsForAnyOmittedFields(
        current,
        mainDefinition,
        fragmentMap,
        node.selectionSet,
      );
    } else if (node.kind === 'FragmentSpread') {
      var fragment = fragmentMap[node.name.value];
      insertNullsForAnyOmittedFields(
        current,
        mainDefinition,
        fragmentMap,
        fragment.selectionSet,
      );
    } else if (isField(node)) {
      var value = current[node.name.value];
      if (node.name.value === '__typename') {
        // Don't mess with special fields like __typename
      } else if (typeof value === 'undefined') {
        // Patch in a null where the field would have been marked as missing
        current[node.name.value] = null;
      } else if (
        value != null &&
        typeof value === 'object' &&
        node.selectionSet != null
      ) {
        insertNullsForAnyOmittedFields(
          value,
          mainDefinition,
          fragmentMap,
          node.selectionSet,
        );
      } else {
        // Other types (string, number) do not need recursive patching!
      }
    } else {
      // This will give a TypeScript build-time error if you did something wrong or the AST changes!
      return (function(node) {
        throw new Error('Unhandled Node Type in SelectionSetNode.selections');
      })(node);
    }
  });
}
var getURIFromEndpoints = function(endpoints, endpoint) {
  return (
    endpoints[endpoint || DEFAULT_ENDPOINT_KEY] ||
    endpoints[DEFAULT_ENDPOINT_KEY]
  );
};
var replaceParam = function(endpoint, name, value) {
  if (value === undefined || name === undefined) {
    return endpoint;
  }
  return endpoint.replace(':' + name, value);
};
/**
 * Some keys should be passed through transparently without normalizing/de-normalizing
 */
var noMangleKeys = ['__typename'];
/** Recursively descends the provided object tree and converts all the keys */
var convertObjectKeys = function(object, __converter, keypath) {
  if (keypath === void 0) {
    keypath = [];
  }
  var converter = null;
  if (__converter.length != 2) {
    converter = function(name, keypath) {
      return __converter(name);
    };
  } else {
    converter = __converter;
  }
  if (object == null || typeof object !== 'object') {
    // Object is a scalar or null / undefined => no keys to convert!
    return object;
  }
  if (Array.isArray(object)) {
    return object.map(function(o, index) {
      return convertObjectKeys(o, converter, keypath.concat([String(index)]));
    });
  }
  return Object.keys(object).reduce(function(acc, key) {
    var value = object[key];
    if (noMangleKeys.indexOf(key) !== -1) {
      acc[key] = value;
      return acc;
    }
    var nestedKeyPath = keypath.concat([key]);
    acc[converter(key, nestedKeyPath)] = convertObjectKeys(
      value,
      converter,
      nestedKeyPath,
    );
    return acc;
  }, {});
};
var noOpNameNormalizer = function(name) {
  return name;
};
/**
 * Helper that makes sure our headers are of the right type to pass to Fetch
 */
export var normalizeHeaders = function(headers) {
  // Make sure that our headers object is of the right type
  if (headers instanceof Headers) {
    return headers;
  } else {
    return new Headers(headers);
  }
};
/**
 * Returns a new Headers Group that contains all the headers.
 * - If there are duplicates, they will be in the returned header set multiple times!
 */
export var concatHeadersMergePolicy = function() {
  var headerGroups = [];
  for (var _i = 0; _i < arguments.length; _i++) {
    headerGroups[_i] = arguments[_i];
  }
  return headerGroups.reduce(function(accumulator, current) {
    if (!current) {
      return accumulator;
    }
    if (!current.forEach) {
      current = normalizeHeaders(current);
    }
    current.forEach(function(value, key) {
      accumulator.append(key, value);
    });
    return accumulator;
  }, new Headers());
};
/**
 * This merge policy deletes any matching headers from the link's default headers.
 * - Pass headersToOverride array & a headers arg to context and this policy will automatically be selected.
 */
export var overrideHeadersMergePolicy = function(
  linkHeaders,
  headersToOverride,
  requestHeaders,
) {
  var result = new Headers();
  linkHeaders.forEach(function(value, key) {
    if (headersToOverride.indexOf(key) !== -1) {
      return;
    }
    result.append(key, value);
  });
  return concatHeadersMergePolicy(result, requestHeaders || new Headers());
};
export var overrideHeadersMergePolicyHelper = overrideHeadersMergePolicy; // Deprecated name
var makeOverrideHeadersMergePolicy = function(headersToOverride) {
  return function(linkHeaders, requestHeaders) {
    return overrideHeadersMergePolicy(
      linkHeaders,
      headersToOverride,
      requestHeaders,
    );
  };
};
export var validateRequestMethodForOperationType = function(
  method,
  operationType,
) {
  switch (operationType) {
    case 'query':
      if (method.toUpperCase() !== 'GET') {
        throw new Error(
          'A "query" operation can only support "GET" requests but got "' +
            method +
            '".',
        );
      }
      return;
    case 'mutation':
      if (
        ['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(method.toUpperCase()) !== -1
      ) {
        return;
      }
      throw new Error('"mutation" operations do not support that HTTP-verb');
    case 'subscription':
      throw new Error('A "subscription" operation is not supported yet.');
    default:
      var _exhaustiveCheck = operationType;
      return _exhaustiveCheck;
  }
};
/**
 * Utility to build & throw a JS Error from a "failed" REST-response
 * @param response: HTTP Response object for this request
 * @param result: Promise that will render the body of the response
 * @param message: Human-facing error message
 */
var rethrowServerSideError = function(response, result, message) {
  var error = new Error(message);
  error.response = response;
  error.statusCode = response.status;
  error.result = result;
  throw error;
};
var addTypeToNode = function(node, typename) {
  if (node === null || node === undefined || typeof node !== 'object') {
    return node;
  }
  if (!Array.isArray(node)) {
    node['__typename'] = typename;
    return node;
  }
  return node.map(function(item) {
    return addTypeToNode(item, typename);
  });
};
var resolver = function(fieldName, root, args, context, info) {
  return __awaiter(_this, void 0, void 0, function() {
    var _this = this;
    var directives,
      isLeaf,
      resultKey,
      exportVariables,
      aliasedNode,
      preAliasingNode,
      isATypeCall,
      isNotARestCall,
      credentials,
      endpoints,
      headers,
      customFetch,
      operationType,
      typePatcher,
      mainDefinition,
      fragmentDefinitions,
      fieldNameNormalizer,
      linkLevelNameDenormalizer,
      fragmentMap,
      _a,
      path,
      endpoint,
      pathBuilder,
      uri,
      argsWithExport,
      bothPathsProvided,
      neitherPathsProvided,
      pathBuilderState,
      pathWithParams,
      _b,
      method,
      type_1,
      bodyBuilder,
      bodyKey,
      perRequestNameDenormalizer,
      body,
      maybeBody_1,
      error_1;
    return __generator(this, function(_c) {
      switch (_c.label) {
        case 0:
          (directives = info.directives),
            (isLeaf = info.isLeaf),
            (resultKey = info.resultKey);
          exportVariables = context.exportVariables;
          aliasedNode = (root || {})[resultKey];
          preAliasingNode = (root || {})[fieldName];
          if (root && directives && directives.export) {
            // @export(as:) is only supported with apollo-link-rest at this time
            // so use the preAliasingNode as we're responsible for implementing aliasing!
            exportVariables[directives.export.as] = preAliasingNode;
          }
          isATypeCall = directives && directives.type;
          if (!isLeaf && isATypeCall) {
            // @type(name: ) is only supported inside apollo-link-rest at this time
            // so use the preAliasingNode as we're responsible for implementing aliasing!
            // Also: exit early, since @type(name: ) && @rest() can't both exist on the same node.
            if (directives.rest) {
              throw new Error(
                'Invalid use of @type(name: ...) directive on a call that also has @rest(...)',
              );
            }
            return [
              2 /*return*/,
              addTypeToNode(preAliasingNode, directives.type.name),
            ];
          }
          isNotARestCall = !directives || !directives.rest;
          if (isLeaf || isNotARestCall) {
            // This is a leaf API call, it's not tagged with @rest()
            // This might not belong to us so return the aliasNode version preferentially
            return [2 /*return*/, aliasedNode || preAliasingNode];
          }
          (credentials = context.credentials),
            (endpoints = context.endpoints),
            (headers = context.headers),
            (customFetch = context.customFetch),
            (operationType = context.operationType),
            (typePatcher = context.typePatcher),
            (mainDefinition = context.mainDefinition),
            (fragmentDefinitions = context.fragmentDefinitions),
            (fieldNameNormalizer = context.fieldNameNormalizer),
            (linkLevelNameDenormalizer = context.fieldNameDenormalizer);
          fragmentMap = createFragmentMap(fragmentDefinitions);
          (_a = directives.rest),
            (path = _a.path),
            (endpoint = _a.endpoint),
            (pathBuilder = _a.pathBuilder);
          uri = getURIFromEndpoints(endpoints, endpoint);
          _c.label = 1;
        case 1:
          _c.trys.push([1, 3, , 4]);
          argsWithExport = __assign({}, args, exportVariables);
          bothPathsProvided = path != null && pathBuilder != null;
          neitherPathsProvided = path == null && pathBuilder == null;
          if (bothPathsProvided || neitherPathsProvided) {
            pathBuilderState = bothPathsProvided
              ? 'both, please remove one!'
              : 'neither, please add one!';
            throw new Error(
              'One and only one of ("path" | "pathBuilder") must be set in the @rest() directive. ' +
                ('This request had ' + pathBuilderState),
            );
          }
          if (!pathBuilder) {
            pathBuilder = function(args) {
              var pathWithParams = Object.keys(args).reduce(function(acc, e) {
                return replaceParam(acc, e, args[e]);
              }, path);
              if (pathWithParams.includes(':')) {
                throw new Error(
                  'Missing parameters to run query, specify it in the query params or use ' +
                    'an export directive. (If you need to use ":" inside a variable string' +
                    ' make sure to encode the variables properly using `encodeURIComponent' +
                    '`. Alternatively see documentation about using pathBuilder.)',
                );
              }
              return pathWithParams;
            };
          }
          pathWithParams = pathBuilder(argsWithExport);
          (_b = directives.rest),
            (method = _b.method),
            (type_1 = _b.type),
            (bodyBuilder = _b.bodyBuilder),
            (bodyKey = _b.bodyKey),
            (perRequestNameDenormalizer = _b.fieldNameDenormalizer);
          if (!method) {
            method = 'GET';
          }
          body = undefined;
          if (
            -1 === ['GET', 'DELETE'].indexOf(method) &&
            operationType === 'mutation'
          ) {
            // Prepare our body!
            if (!bodyBuilder) {
              maybeBody_1 = argsWithExport[bodyKey || 'input'];
              if (!maybeBody_1) {
                throw new Error(
                  '[GraphQL mutation using a REST call without a body]. No `input` was detected. Pass bodyKey, or bodyBuilder to the @rest() directive to resolve this.',
                );
              }
              bodyBuilder = function(argsWithExport) {
                return maybeBody_1;
              };
            }
            body = convertObjectKeys(
              bodyBuilder(argsWithExport),
              perRequestNameDenormalizer ||
                linkLevelNameDenormalizer ||
                noOpNameNormalizer,
            );
          }
          validateRequestMethodForOperationType(
            method,
            operationType || 'query',
          );
          return [
            4 /*yield*/,
            (customFetch || fetch)('' + uri + pathWithParams, {
              credentials: credentials,
              method: method,
              headers: headers,
              body: body && JSON.stringify(body),
            })
              .then(function(res) {
                return __awaiter(_this, void 0, void 0, function() {
                  var parsed, error_2;
                  return __generator(this, function(_a) {
                    switch (_a.label) {
                      case 0:
                        if (!(res.status >= 300)) return [3 /*break*/, 6];
                        parsed = void 0;
                        _a.label = 1;
                      case 1:
                        _a.trys.push([1, 3, , 5]);
                        return [4 /*yield*/, res.json()];
                      case 2:
                        parsed = _a.sent();
                        return [3 /*break*/, 5];
                      case 3:
                        error_2 = _a.sent();
                        return [4 /*yield*/, res.text()];
                      case 4:
                        // its not json
                        parsed = _a.sent();
                        return [3 /*break*/, 5];
                      case 5:
                        rethrowServerSideError(
                          res,
                          parsed,
                          'Response not successful: Received status code ' +
                            res.status,
                        );
                        _a.label = 6;
                      case 6:
                        return [2 /*return*/, res];
                    }
                  });
                });
              })
              .then(function(res) {
                context.responses.push(res);
                // HTTP-204 means "no-content", similarly Content-Length implies the same
                // This commonly occurs when you POST/PUT to the server, and it acknowledges
                // success, but doesn't return your Resource.
                return res.status === 204 ||
                  res.headers.get('Content-Length') === '0'
                  ? Promise.resolve({})
                  : res.json();
              })
              .then(function(result) {
                return fieldNameNormalizer == null
                  ? result
                  : convertObjectKeys(result, fieldNameNormalizer);
              })
              .then(function(result) {
                return findRestDirectivesThenInsertNullsForOmittedFields(
                  resultKey,
                  result,
                  mainDefinition,
                  fragmentMap,
                  mainDefinition.selectionSet,
                );
              })
              .then(function(result) {
                return addTypeNameToResult(result, type_1, typePatcher);
              }),
          ];
        case 2:
          return [2 /*return*/, _c.sent()];
        case 3:
          error_1 = _c.sent();
          throw error_1;
        case 4:
          return [2 /*return*/];
      }
    });
  });
};
/**
 * Default key to use when the @rest directive omits the "endpoint" parameter.
 */
var DEFAULT_ENDPOINT_KEY = '';
/**
 * RestLink is an apollo-link for communicating with REST services using GraphQL on the client-side
 */
var RestLink = /** @class */ (function(_super) {
  __extends(RestLink, _super);
  function RestLink(_a) {
    var uri = _a.uri,
      endpoints = _a.endpoints,
      headers = _a.headers,
      fieldNameNormalizer = _a.fieldNameNormalizer,
      fieldNameDenormalizer = _a.fieldNameDenormalizer,
      typePatcher = _a.typePatcher,
      customFetch = _a.customFetch,
      credentials = _a.credentials;
    var _this = _super.call(this) || this;
    var fallback = {};
    fallback[DEFAULT_ENDPOINT_KEY] = uri || '';
    _this.endpoints = Object.assign({}, endpoints || fallback);
    if (uri == null && endpoints == null) {
      throw new Error(
        'A RestLink must be initialized with either 1 uri, or a map of keyed-endpoints',
      );
    }
    if (uri != null) {
      var currentDefaultURI = (endpoints || {})[DEFAULT_ENDPOINT_KEY];
      if (currentDefaultURI != null && currentDefaultURI != uri) {
        throw new Error(
          "RestLink was configured with a default uri that doesn't match what's passed in to the endpoints map.",
        );
      }
      _this.endpoints[DEFAULT_ENDPOINT_KEY] = uri;
    }
    if (_this.endpoints[DEFAULT_ENDPOINT_KEY] == null) {
      console.warn(
        'RestLink configured without a default URI. All @rest(…) directives must provide an endpoint key!',
      );
    }
    if (typePatcher == null) {
      _this.typePatcher = function(result, __typename, _2) {
        return __assign({ __typename: __typename }, result);
      };
    } else if (
      !Array.isArray(typePatcher) &&
      typeof typePatcher === 'object' &&
      Object.keys(typePatcher)
        .map(function(key) {
          return typePatcher[key];
        })
        .reduce(
          // Make sure all of the values are patcher-functions
          function(current, patcher) {
            return current && typeof patcher === 'function';
          },
          true,
        )
    ) {
      var table_1 = typePatcher;
      _this.typePatcher = function(data, outerType, patchDeeper) {
        var __typename = data.__typename || outerType;
        if (Array.isArray(data)) {
          return data.map(function(d) {
            return patchDeeper(d, __typename, patchDeeper);
          });
        }
        var subPatcher =
          table_1[__typename] ||
          function(result) {
            return result;
          };
        return __assign(
          { __typename: __typename },
          subPatcher(data, __typename, patchDeeper),
        );
      };
    } else {
      throw new Error(
        'RestLink was configured with a typePatcher of invalid type!',
      );
    }
    _this.fieldNameNormalizer = fieldNameNormalizer || null;
    _this.fieldNameDenormalizer = fieldNameDenormalizer || null;
    _this.headers = normalizeHeaders(headers);
    _this.credentials = credentials || null;
    _this.customFetch = customFetch;
    return _this;
  }
  RestLink.prototype.request = function(operation, forward) {
    var query = operation.query,
      variables = operation.variables,
      getContext = operation.getContext,
      setContext = operation.setContext;
    var context = getContext();
    var isRestQuery = hasDirectives(['rest'], operation.query);
    if (!isRestQuery) {
      return forward(operation);
    }
    // 1. Use the user's merge policy if any
    var headersMergePolicy = context.headersMergePolicy;
    if (
      headersMergePolicy == null &&
      Array.isArray(context.headersToOverride)
    ) {
      // 2.a. Override just the passed in headers, if user provided that optional array
      headersMergePolicy = makeOverrideHeadersMergePolicy(
        context.headersToOverride,
      );
    } else if (headersMergePolicy == null) {
      // 2.b Glue the link (default) headers to the request-context headers
      headersMergePolicy = concatHeadersMergePolicy;
    }
    var headers = headersMergePolicy(this.headers, context.headers);
    var credentials = context.credentials || this.credentials;
    var queryWithTypename = addTypenameToDocument(query);
    var mainDefinition = getMainDefinition(query);
    var fragmentDefinitions = getFragmentDefinitions(query);
    var operationType = (mainDefinition || {}).operation || 'query';
    var requestContext = {
      headers: headers,
      endpoints: this.endpoints,
      // Provide an empty hash for this request's exports to be stuffed into
      exportVariables: {},
      credentials: credentials,
      customFetch: this.customFetch,
      operationType: operationType,
      fieldNameNormalizer: this.fieldNameNormalizer,
      fieldNameDenormalizer: this.fieldNameDenormalizer,
      mainDefinition: mainDefinition,
      fragmentDefinitions: fragmentDefinitions,
      typePatcher: this.typePatcher,
      responses: [],
    };
    var resolverOptions = {};
    return new Observable(function(observer) {
      graphql(
        resolver,
        queryWithTypename,
        null,
        requestContext,
        variables,
        resolverOptions,
      )
        .then(function(data) {
          setContext({
            restResponses: (context.restResponses || []).concat(
              requestContext.responses,
            ),
          });
          observer.next({ data: data });
          observer.complete();
        })
        .catch(function(err) {
          if (err.name === 'AbortError') return;
          if (err.result && err.result.errors) {
            observer.next(err.result);
          }
          observer.error(err);
        });
    });
  };
  return RestLink;
})(ApolloLink);
export { RestLink };
//# sourceMappingURL=restLink.js.map
