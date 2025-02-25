# promi-safe

🌏 [**한국어**](README.md) | English

promi-safe is a lightweight and type-safe promise wrapper that can validate the return value of a promise at runtime.

It easily integrates with various runtime type-checking libraries through the StandardSchema interface.

## Motivation

When developing real-world applications, API responses may differ from the types expected by the frontend.

For example, required fields might be missing, or a value that should be a string may be returned as a number. Such discrepancies can trigger subtle bugs and make debugging challenging.

promi-safe validates the result of a promise according to a schema, helping to prevent these issues and enabling appropriate handling in case of validation failure.

## Setup

```bash
npm install promi-safe
pnpm add promi-safe
pnpm add promi-safe
```

## Usage

It is recommended to use this library together with libraries that satisfy the [StandardSchema interface](https://github.com/standard-schema/standard-schema#what-schema-libraries-implement-the-spec).  
The example below uses [zod](https://github.com/colinhacks/zod).

```ts
import { makeSafePromise } from "promi-safe";
import { z } from "zod";

const promise = (await fetch("/test")).json();
const promiseWithSafe = makeSafePromise(apiCall);
const schema = z.object({ id: z.string() }); // with zod

const response = promiseWithSafe.safe(schema);
```

When abstracting an httpClient, it can be used even more conveniently.

```ts
import { makeSafePromise } from "promi-safe";

export const createHttpClient = (): HttpClient => {
  return {
    get: <T>(url: string, options?: RequestOptions) =>
      makeSafePromise(request<T>("GET", url, undefined, options)),
    ...
  };
};
```

```ts
import { z } from "zod";

const schema = z.object({ id: z.string() }); // with zod
const response = await api.get("/test").safe(schema);
```

## API

- **validateResponse(promise)(schema, options?):**  
  Validates the provided promise's resolved value against the given schema. The options are as follows:

  - `onFail`: A callback function that is called with the issues when validation fails.
  - `throwOnError`: If true, a `ValidationError` is thrown when validation fails.

- **makeSafePromise(promise):**  
  Extends the given promise by adding a `safe` method that enables the same validation as above.

- **ValidationError**  
  An error class that is thrown when validation fails (when the throwOnError option is used). The error object includes an `issues` property containing the list of validation problems.

## License

MIT
