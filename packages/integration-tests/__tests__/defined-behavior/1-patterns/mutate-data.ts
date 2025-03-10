import { a, ClientSchema } from '@aws-amplify/data-schema';
import { Amplify } from 'aws-amplify';
import {
  buildAmplifyConfig,
  mockedGenerateClient,
  optionsAndHeaders,
} from '../../utils';

const sampleTodo = {
  __typename: 'Todo',
  id: 'some-id',
  content: 'some content',
  description: 'something something',
  owner: 'some-body',
  done: false,
  updatedAt: '2024-03-01T19:05:44.536Z',
  createdAt: '2024-03-01T18:05:44.536Z',
};

describe('Create, update, and delete application data', () => {
  // https://docs.amplify.aws/gen2/build-a-backend/data/mutate-data/

  // data/resource.ts
  // #region covers 93fbc94ef4f108d8
  const schema = a.schema({
    Todo: a
      .model({
        content: a.string(),
        description: a.string(),
        done: a.boolean(),
        priority: a.enum(['low', 'medium', 'high']),
      })
      .authorization((allow) => [
        allow.owner(),
        allow.publicApiKey().to(['read']),
      ]),
  });
  // #endregion
  type Schema = ClientSchema<typeof schema>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('create an item', async () => {
    // #region mocking
    const { spy, generateClient } = mockedGenerateClient([
      {
        data: {
          createTodo: sampleTodo,
        },
      },
    ]);

    // simulated amplifyconfiguration.json
    const config = await buildAmplifyConfig(schema);
    // #endregion mocking

    // #region covers 3137a2b60aedf773, 95716a52d6270a63, 526c23ab1a272548
    // App.tsx
    Amplify.configure(config);
    const client = generateClient<Schema>();
    const { errors, data: newTodo } = await client.models.Todo.create({
      content: 'My new todo',
      done: true,
    });
    // #endregion

    // #region assertions
    expect(optionsAndHeaders(spy)).toMatchSnapshot();
    expect(errors).toBeUndefined();
    expect(newTodo).toEqual(sampleTodo);
    // #endregion assertions
  });

  test('update an item', async () => {
    // #region mocking
    const { spy, generateClient } = mockedGenerateClient([
      {
        data: {
          updateTodo: sampleTodo,
        },
      },
    ]);

    // simulated amplifyconfiguration.json
    const config = await buildAmplifyConfig(schema);
    // #endregion mocking

    // #region covers 704cbd0a4efed24a
    Amplify.configure(config);
    const client = generateClient<Schema>();
    const { data: updatedTodo, errors } = await client.models.Todo.update({
      id: 'some_id',
      description: 'Updated description',
    });
    // #endregion

    // #region assertions
    expect(optionsAndHeaders(spy)).toMatchSnapshot();
    expect(errors).toBeUndefined();
    expect(updatedTodo).toEqual(sampleTodo);
    // #endregion assertions
  });

  test('delete an item', async () => {
    // #region mocking
    const { spy, generateClient } = mockedGenerateClient([
      {
        data: {
          deleteTodo: sampleTodo,
        },
      },
    ]);

    // simulated amplifyconfiguration.json
    const config = await buildAmplifyConfig(schema);
    // #endregion mocking

    // #region covers 14bd2ab04fd722de, a0aebe5c8b5a2797
    Amplify.configure(config);
    const client = generateClient<Schema>();
    const toBeDeletedTodo = {
      id: '123123213',
    };
    const { data: deletedTodo, errors } =
      await client.models.Todo.delete(toBeDeletedTodo);
    // #endregion

    // #region assertions
    expect(optionsAndHeaders(spy)).toMatchSnapshot();
    expect(errors).toBeUndefined();
    expect(deletedTodo).toEqual(sampleTodo);
    // #endregion assertions
  });

  test.skip('Cancel create, update, and delete requests', async () => {
    /**
     * Attempting to
     */

    // #region mocking
    const { spy, generateClient } = mockedGenerateClient([
      // result that never arrives
      new Promise(() => {}) as any,
    ]);

    // simulated amplifyconfiguration.json
    const config = await buildAmplifyConfig(schema);
    Amplify.configure(config);

    // the cancellation example in docs is expected to log errors to the console.
    const consoleSpy = jest.spyOn(console, 'log');
    // #endregion mocking

    // #region docs code
    // slight variation for testability
    const client = generateClient<Schema>();

    // Where we'll put the request promise we eventually need to cancel
    let promise: ReturnType<typeof client.models.Todo.create>;

    // Example button handler to create a record
    const createHandler = async () => {
      promise = client.models.Todo.create({ content: 'New Todo ' });
      //  ^ Note: we're not awaiting the request, we're returning the promise

      try {
        await promise;
      } catch (error) {
        console.log(error);
        // If the error is because the request was cancelled you can confirm here.
        if (client.isCancelError(error)) {
          // TODO: apparently a bug in the type guard. needs to be fixed:
          // @ts-expect-error
          console.log(error.message); // "my message for cancellation"
          // handle user cancellation logic
        }
      }
    };

    // Example cancel button handler
    const cancelHandler = () => {
      client.cancel(promise, 'my message for cancellation');
    };

    // simulated button clicks
    createHandler();
    cancelHandler();
    // #endregion docs code

    // #region assertions
    await expect(promise!).rejects.toThrow();
    expect(consoleSpy.mock.calls).toEqual([{}]);
    // #endregion assertions
  });
});
