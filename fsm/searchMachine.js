import { setup, fromPromise, assign } from 'xstate';
import axios from 'axios';

export const searchMachine = setup({
    actors: {
        search: fromPromise(async ({ input }) => {
            console.log("inside search: ", input);

            const token = input.authToken;
            const key = Object.keys(input.queryparams)[0];
            console.log("FSM Actor: search actor invoked with key:", key)
            const value = input.queryparams[key];
            console.log("FSM Actor: search actor invoked with value:", value)

            const header = {
                "Content-Type": "application/json",
                "Authorization": token,
            }

            const url = `http://10.51.41.13:8082/consignments/search?${key}=${encodeURIComponent(value)}`;
            
            try {
                console.log("inside try block")
                const response = await fetch(url, {
                    method: 'GET',
                    headers: header,
                });
                console.log("response type: ", typeof(response));
                console.log("response status: ", response.status);
                console.log("response headers: ", response.headers);

                if (!response.ok) {
                    console.log("response not (ok): ");
                    let errorMessage;
                    try {
                        const error = await response.json();
                        errorMessage = error;
                    } catch (parseError) {
                        const textError = await response.text();
                        errorMessage = textError;
                        console.error("Error parsing JSON error:", parseError);
                    }
                    console.log("====>error: ", errorMessage);
                    return  errorMessage;
                }

            
                const data = await response.json();
                console.log("Got successful response: ", data);
                if(data){
                    return data;
                }

            } catch (err) {
                console.error("Fetch error:", err.message);

                return err;
            }
        }),
    },

    actions: {

        searchQuery:({context},params)=>{
            console.log("coming here---->")
        },
    },
}).createMachine({
    id: 'search',
    initial: 'idle',
    context: ({input})=>({
        token: input.authToken,
        query: input.queryparams,
        result: '',
        errorMessage: '',
        error: '',
        status:'',
    }),
    states: {
        idle: {
            on: {
                SUBMIT: {
                    target: "searching",
                },
            },
        },
        searching: {
            invoke: {
                id: 'searchActor',
                src: 'search',
                input: ({ context }) => {
                    console.log("context: >", context)
                    return{
                        queryparams:context.query,
                        authToken:context.token
                    }
                    
                },
                onDone: {
                    target: 'success',
                    actions: assign({ 
                        result: ({ event }) => event.output,
                    }),
                },
                onError: [
                    {
                        target: 'searchFailed',
                        actions: assign({
                            error: ({ event }) => event.message 
                          })
                    }
                ],
            },
        },
        success: {
            entry:[{type:"searchQuery"}],
            type: "final",
        
        },
        searchFailed: {
            type: 'final',
            entry: (context) => {
                console.log('FSM: Search failed. Error:', context);
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
   
});