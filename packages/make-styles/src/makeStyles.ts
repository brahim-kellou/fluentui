import { CAN_USE_CSS_VARIABLES } from './constants';
import { createCSSVariablesProxy, resolveDefinitions } from './runtime/index';
import {
  MakeStylesDefinition,
  MakeStylesMatchedDefinitions,
  MakeStylesOptions,
  MakeStylesResolvedDefinition,
} from './types';

export function makeStyles<Selectors, Tokens>(
  definitions: MakeStylesDefinition<Selectors, Tokens>[],
  unstable_cssPriority: number = 0,
) {
  const cxCache: Record<string, string> = {};

  function computeClasses(selectors: Selectors, options: MakeStylesOptions<Tokens>): string {
    let tokens: Tokens | null;
    let resolvedDefinitions: MakeStylesResolvedDefinition<Selectors, Tokens>[];

    // TODO: describe me
    if (process.env.NODE_ENV === 'production') {
      tokens = CAN_USE_CSS_VARIABLES ? null : options.tokens;
      resolvedDefinitions = CAN_USE_CSS_VARIABLES
        ? ((definitions as unknown) as MakeStylesResolvedDefinition<Selectors, Tokens>[])
        : resolveDefinitions(
            (definitions as unknown) as MakeStylesResolvedDefinition<Selectors, Tokens>[],
            tokens,
            unstable_cssPriority,
          );
    } else {
      tokens = CAN_USE_CSS_VARIABLES ? createCSSVariablesProxy(options.tokens) : options.tokens;
      resolvedDefinitions = resolveDefinitions(
        (definitions as unknown) as MakeStylesResolvedDefinition<Selectors, Tokens>[],
        tokens,
        unstable_cssPriority,
      );
    }

    let matchedIndexes = '';
    const matchedDefinitions: MakeStylesMatchedDefinitions[] = [];

    for (let i = 0, l = resolvedDefinitions.length; i < l; i++) {
      const matcherFn = resolvedDefinitions[i][0];

      if (matcherFn === null || matcherFn(selectors)) {
        matchedDefinitions.push(resolvedDefinitions[i][2]);
        matchedIndexes += i;
      }
    }

    const cxCacheKey = options.renderer.id + matchedIndexes;
    const cxCacheElement = cxCache[cxCacheKey];

    if (CAN_USE_CSS_VARIABLES && cxCacheElement !== undefined) {
      return cxCacheElement;
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const resultDefinitions: MakeStylesMatchedDefinitions = Object.assign({}, ...matchedDefinitions, overrides);
    const resultClasses = options.renderer.insertDefinitions(resultDefinitions, !!options.rtl);

    cxCache[cxCacheKey] = resultClasses;

    return resultClasses;
  }

  return computeClasses;
}
