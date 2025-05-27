import { assign, fromPromise, setup } from 'xstate';
import fetch from 'node-fetch';

export const rejectUploadMachine = setup({
  actors: {
    uploadRequest: fromPromise(async ({ input }) => {
      console.log("inside uploadRequest: ", input);
      console.log("-----------------------------");
      const Authorizationtoken = input.authToken;
      const headersToSend = {
        'Content-Type': 'application/json',
        'Authorization': Authorizationtoken
      }

      const { fileName, recordCount, userId, acceptCount, rejectCount, rejectedRows, acceptedRows, uploadedBy, fileType } = input.queryparams

      console.log("Request Headers (FSM):", headersToSend);

      const response = await fetch(`http://localhost:8082/consignments/reject?fileName=${fileName}&recordCount=${recordCount}&userId=${userId}&accept_record_count=${acceptCount}&reject_record_count=${rejectCount}&rejectedRows=${rejectedRows}&acceptedRows=${acceptedRows}&uploadedBy=${uploadedBy}&fileType=${fileType}`, {
        method: 'POST',
        headers: headersToSend,
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
  id: 'reject',
  initial: 'idle',
  context: ({input})=>({
    queryparams: input.queryparams,
    authToken:input.authToken,
    result: '',
    error: '',
  }),
  states: {
    idle: {
      on: {
        REJECT: {
          target: 'loading',
         
        }
      }
    },
    loading: {
      invoke: {
        src: 'uploadRequest',
        input: ({ context }) => {
          console.log("Context in loading state (before uploadRequest):", context);
          return {
            queryparams:{
              fileName:context.queryparams.fileName,
              recordCount:context.queryparams.recordCount,
              userId:context.queryparams.userId,
              acceptCount:context.queryparams.acceptCount,
              rejectCount:context.queryparams.rejectCount,
              rejectedRows:context.queryparams.rejectedRows,
              acceptedRows:context.queryparams.acceptedRows,
              uploadedBy:context.queryparams.uploadedBy,
              fileType:context.queryparams.fileType
            },
            authToken:context.authToken
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
            error: ({ event }) => event.error || 'Upload failed',
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