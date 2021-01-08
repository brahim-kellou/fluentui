import { HASH_PREFIX_CODE, RTL_PREFIX_CODE } from './constants';

/**
 * This length includes a leading character "f" or "r", e.g. `"f1s4A"` would be a valid atomic property hash.
 */
const ATOMIC_PROPERTY_LENGTH = 5;

/**
 * Function can take any number of arguments, joins classes together and deduplicates atomic declarations.
 *
 * Atomic declarations take the form of `f{property}{value}` or f{property}{value}`, where both `property` and `value`
 * are hashes **four characters long**.
 *
 * Classnames can be of any length, this function can take both atomic declarations and class names.
 *
 * Input:
 * ```
 * ax('ui-button', 'faaaabbbb', 'fccccdddd')
 * ```
 *
 * Output:
 * ```
 * 'ui-button fccccdddd'
 * ```
 */
export function ax(...classNames: (string | undefined)[]): string;

export function ax(): string {
  // arguments are parsed manually to avoid double loops as TS & Babel transforms rest via an additional loop
  // @see https://babeljs.io/docs/en/babel-plugin-transform-parameters

  // short circuit if theres no custom class names
  if (arguments.length <= 1) {
    // eslint-disable-next-line prefer-rest-params
    return arguments[0] || '';
  }

  const atomicProperties: Record<string, string> = {};

  for (let i = 0; i < arguments.length; i++) {
    // eslint-disable-next-line prefer-rest-params
    const cls = arguments[i];

    if (!cls) {
      continue;
    }

    const classGroups = cls.split(' ');

    for (let x = 0; x < classGroups.length; x++) {
      const atomicClassName = classGroups[x];

      const firstCharacterCode = atomicClassName.charCodeAt(0);
      const isAtomicClassName = firstCharacterCode === HASH_PREFIX_CODE || firstCharacterCode === RTL_PREFIX_CODE;

      const atomicGroupName = atomicClassName.slice(0, isAtomicClassName ? ATOMIC_PROPERTY_LENGTH : undefined);

      atomicProperties[atomicGroupName] = atomicClassName;
    }
  }

  let resultClassName = '';

  // eslint-disable-next-line guard-for-in
  for (const property in atomicProperties) {
    resultClassName += atomicProperties[property] + ' ';
  }

  return resultClassName.slice(0, -1);
}
