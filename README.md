# promi-safe

🌏 한국어 | [**English**](README.en.md)

safe-promise는 프로미스의 반환값을 런타임에서 검증할 수 있는 가볍고 타입 안전한 프로미스 래퍼입니다.

StandardSchema 인터페이스를 통해 다양한 런타임 타입 체크 라이브러리와 손쉽게 통합할 수 있습니다.

## Motivation

실제 애플리케이션을 개발하다 보면, API 응답이 프론트엔드에서 기대하는 타입과 다를 수 있습니다.

있어야 할 필드가 없거나, string이어야 하는데 number로 내려오는 등, 이러한 불일치는 미묘한 버그를 유발하며 디버깅을 어렵게 만듭니다.

safe-promise는 프로미스의 결괏값을 스키마에 따라 검증하여 이러한 문제를 미연에 방지하고, 검증 실패 시 적절한 처리를 할 수 있도록 도와줍니다.

## Setup

```bash
npm install promi-safe
pnpm add promi-safe
pnpm add promi-safe
```

## Usage

[StandardSchema 인터페이스를 만족하는 라이브러리](https://github.com/standard-schema/standard-schema#what-schema-libraries-implement-the-spec)와 함께 사용하시길 권장합니다.  
아래 예시에서는 [zod](https://github.com/colinhacks/zod)를 사용했습니다.

```ts
import { makeSafePromise } from "promi-safe";
import { z } from "zod";

const promise = (await fetch("/test")).json();
const promiseWithSafe = makeSafePromise(apiCall);
const schema = z.object({ id: z.string() }); // with zod

const response = promiseWithSafe.safe(schema);
```

httpClient를 추상화하는 경우, 더 편리하게 사용할 수 있습니다.

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
  제공된 프로미스의 반환값을 주어진 스키마를 기준으로 검증합니다. 옵션은 아래와 같습니다:

  - `onFail`: 검증 실패 시 발생한 이슈를 인자로 호출되는 콜백 함수.
  - `throwOnError`: 이 값이 true일 경우, 검증 실패 시 `ValidationError`가 발생합니다.

- **makeSafePromise(promise):**  
  주어진 프로미스에 `safe` 메서드를 추가하여 위와 동일한 검증을 할 수 있도록 확장합니다.

- **ValidationError**  
  검증 실패 시 (throwOnError 옵션 사용 시) 발생하는 에러 클래스입니다. 에러 객체에는 `issues` 프로퍼티가 포함되어 있어 검증 문제 목록을 제공합니다.

## License

MIT
