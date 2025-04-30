import { assign, fromPromise, setup } from 'xstate';
import fetch from 'node-fetch';

export const appMachine = setup({
  actors: {
    loginRequest: fromPromise(async ({ input }) => {
      console.log("inside loginRequest");
      const headersToSend = {
        'Content-Type': 'application/json',
      };
      const requestBody = JSON.stringify({
        username: input.username,
        password: input.password,
        branchCd: input.branchCd
      });

      console.log("Request Headers (FSM):", headersToSend);
      console.log("Request Body (FSM):", requestBody);

      const response = await fetch('http://localhost:8082/users/login', {
        method: 'POST',
        headers: headersToSend,
        body: requestBody,
      });

      if (!response.ok) {
        const error = await response.json();
        console.log("====>error:", error);
        throw error;
      }
      console.log("successsss")
      return await response.json();
    }),
  }
}).createMachine({
  id: 'login',
  initial: 'idle',
  context: ({input})=>({
    payload: input.payload,
    result: '',

    error: '',
  }),
  states: {
    idle: {
      on: {
        SUBMIT: {
          target: 'loading',
         
        }
      }
    },
    loading: {
      invoke: {
        src: 'loginRequest',
        input: ({ context }) => {
          console.log("Context in loading state (before loginRequest):", context);
          return {
            username: context.payload.username,
            password: context.payload.password,
            branchCd: context.payload.branchCd,
          }
        },
        onDone: {
          target: 'success',
          actions: assign({
            result: ({ event }) => event.output,
          })
        },
        onError: {
          target: 'failure',
          actions: assign({
            error: ({ event }) => event.error || 'Login failed',
          })
        }
      }
    },
    success: {
      type: 'final'
    },
    failure: {
      on: {
        RETRY: 'loading'
      }
    }
  }
});