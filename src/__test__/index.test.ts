import { StandardSchemaV1 } from "@standard-schema/spec";
import { makeSafePromise, validateResponse, ValidationError } from "..";

const createSchema = (result: unknown): StandardSchemaV1 => {
  return {
    "~standard": {
      version: 1,
      vendor: "safe-promise",
      validate: jest.fn().mockReturnValue(result),
    },
  };
};

const createPromise = (result: unknown) => Promise.resolve(result);

const schemas = [
  {
    description: "when validate returns result synchronously",
    schema: (result: unknown) => createSchema(result),
  },
  {
    description: "when validate returns result asynchronously",
    schema: (result: unknown) => createSchema(Promise.resolve(result)),
  },
];

describe("validateResponse", () => {
  const RESULT = "result";
  const PROMISE = createPromise(RESULT);

  describe("Valid response (when issues do not exist)", () => {
    it.each(schemas)(
      "$description, returns the original response",
      async ({ schema }) => {
        const expectedResponse = await PROMISE;
        const result = await validateResponse(PROMISE)(schema({}));

        expect(result).toEqual(expectedResponse);
      }
    );
    it.each(schemas)(
      "$description, onFail is not called",
      async ({ schema }) => {
        const onFail = jest.fn();
        await validateResponse(PROMISE)(schema(RESULT), {
          onFail,
        });

        expect(onFail).not.toHaveBeenCalled();
      }
    );
    it.each(schemas)(
      "$description, ValidationError is not thrown even when throwOnError is true",
      async ({ schema }) => {
        const expectedResponse = await PROMISE;

        await expect(
          validateResponse(PROMISE)(schema({}), { throwOnError: true })
        ).resolves.toEqual(expectedResponse);
      }
    );
  });

  describe("Invalid response (when issues exist)", () => {
    const ISSUES = [{ message: "error" }];

    describe("onFail option", () => {
      it.each(schemas)(
        "$description, onFail is called when throwOnError is true",
        async ({ schema }) => {
          const onFail = jest.fn();
          const safeCall = validateResponse(PROMISE)(
            schema({ issues: ISSUES }),
            { onFail, throwOnError: true }
          );

          await expect(safeCall).rejects.toThrow(ValidationError);
          expect(onFail).toHaveBeenCalledWith(ISSUES);
        }
      );
      it.each(schemas)(
        "$description, onFail is called when throwOnError is false",
        async ({ schema }) => {
          const onFail = jest.fn();
          await validateResponse(PROMISE)(schema({ issues: ISSUES }), {
            onFail,
            throwOnError: false,
          });

          expect(onFail).toHaveBeenCalled();
        }
      );
    });
    describe("throwOnError option", () => {
      it.each(schemas)(
        "$description, ValidationError is thrown when throwOnError is true",
        async ({ schema }) => {
          const safeCall = validateResponse(PROMISE)(
            schema({ issues: ISSUES }),
            {
              throwOnError: true,
            }
          );

          await expect(safeCall).rejects.toThrow(ValidationError);
        }
      );
      it.each(schemas)(
        "$description, returns original response when throwOnError is false",
        async ({ schema }) => {
          const expectedResponse = await PROMISE;
          const safeCall = validateResponse(PROMISE)(
            schema({ issues: ISSUES }),
            {
              throwOnError: false,
            }
          );

          await expect(safeCall).resolves.toEqual(expectedResponse);
        }
      );
    });
  });
});

describe("makeSafePromise", () => {
  it("safe method is added to Promise", () => {
    expect(makeSafePromise(createPromise({}))).toHaveProperty("safe");
  });
});
