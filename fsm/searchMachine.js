// // searchMachine.js
import { setup, fromPromise, assign } from 'xstate';
import axios from 'axios';

export const searchMachine = setup({
    actors: {
        search: fromPromise(async ({ input, context }) => {

            const key = Object.keys(input.query.query)[0];
            const value = input.query.query[key];
            const token = input.query.headers.authorization;
            console.log("token: ", token);
            console.log("FSM Actor: search actor invoked with key:", key)
            console.log("FSM Actor: search actor invoked with value:", value)

            const header = {
                "Content-Type": "application/json",
                "Authorization": token,
            }

            // console.log("FSM: Performing search for:", query);
            const url = `http://10.51.41.13:8082/consignments/search?${key}=${value}`;

            try {
                console.log("inside try block")
                const response = await fetch(url, {
                    method: 'GET',
                    headers: header,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const status = response.status;
                    const message = errorData?.message || 'Search failed';
                    throw { status, message };
                }

                const data = await response.json();
                console.log("Got successful response: ", data);
                return data;

            } catch (error) {
                console.error("Fetch error:", error);
                throw error; // Re-throw the error to be caught by XState
            }
        }),
    },
}).createMachine({
    id: 'search',
    initial: 'idle',
    context: {
        token: undefined,
        query: null,
        results: null,
        errorMessage: null,
    },
    states: {
        idle: {
            on: {
                SUBMIT: {
                    target: "searching",
                    actions: 'assignInputAndTokenToContext', // New action
                },
            },
        },
        searching: {
            invoke: {
                id: 'searchActor',
                src: 'search',
                input: ({ context, event }) => (event.input),
                onDone: {
                    target: 'success',
                    // actions: 'assignResults',
                    actions: assign({ // Use assign directly here
                        results: ({ event }) => event.output,
                        errorMessage: null,
                    }),
                },
                onError: [
                    {
                        target: 'searchFailed',
                        cond: ({ event }) => event.error?.status === 404,
                        actions: 'assignNotFoundError',
                    },
                    {
                        target: 'searchFailed',
                        actions: 'assignError',
                    }
                ],
            },
        },
        success: {
            type: 'final',
            actions: assign({
                results: ({ event }) => event.output,
            })
        },
        searchFailed: {
            type: 'final',
            entry: (context) => {
                console.log('FSM: Search failed. Error:', context.errorMessage);
            },
        },
        noResults: {
            entry: assign({
                results: (_) => null,
                errorMessage: (_) => "No records found.",
            }),
            after: {
                1000: {
                    target: 'idle',
                    actions: () => console.log("FSM: Transitioning from noResults to idle.")
                },
            },
        }
    },
}, {
    actions: {
        assignInputAndTokenToContext: assign(({ event }) => ({
            query: event.input.query,
            token: event.token, // Assign the token to context
        })),
        assignResults: assign(({ event }) => {

            console.log("FSM Action: assignResults is running with event.output:", event.output);
            return {
                results: event.output,
                errorMessage: null,
            }
        }),
        assignError: assign(({ event }) => ({
            results: null,
            errorMessage: event.error.message,
        })),
        assignNotFoundError: assign(({ event }) => ({
            results: null,
            errorMessage: 'No record found for the provided consignment ID.',
        })),
    },
});