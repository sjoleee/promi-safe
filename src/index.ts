import type { StandardSchemaV1 } from "@standard-schema/spec";

interface Options {
  onFail?: (issues: readonly StandardSchemaV1.Issue[]) => void;
  throwOnError?: boolean;
}

export type SafePromise<T> = Promise<T> & {
  safe: (schema: StandardSchemaV1, options?: Options) => Promise<T>;
};

export class ValidationError extends Error {
  constructor(
    public readonly issues: readonly StandardSchemaV1.Issue[],
    message = "Validation failed"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export const validateResponse =
  <T>(promise: Promise<T>) =>
  async (schema: StandardSchemaV1, options?: Options) => {
    const response = await promise;
    const result = schema["~standard"]["validate"](response);
    const awaitedResult = await Promise.resolve(result);

    const _options: Options = {
      throwOnError: options?.throwOnError ?? true,
      onFail: options?.onFail,
    };

    if (awaitedResult.issues) {
      _options.onFail?.(awaitedResult.issues);
      if (_options.throwOnError) {
        throw new ValidationError(awaitedResult.issues);
      }
    }

    return response;
  };

export const makeSafePromise = <T>(promise: Promise<T>): SafePromise<T> =>
  Object.assign(promise, {
    safe: (schema: StandardSchemaV1, options?: Options) =>
      validateResponse(promise)(schema, options),
  });
