import { assign, fromPromise, setup } from 'xstate';
import fetch from 'node-fetch';

export const rejectUploadMachine = setup({
  actors: {
    uploadRequest: fromPromise(async ({ input }) => {
      console.log("inside uploadRequest: ", input);
      console.log("-----------------------------");
      const Authorizationtoken = input.authToken;
      // console.log("token: ",token);
      const headersToSend = {
        'Content-Type': 'application/json',
        'Authorization': Authorizationtoken
      }

      const { fileName, recordCount, userId } = input.queryparams
    //   const requestBody = JSON.stringify(
    //    input.payload
    // );

      console.log("Request Headers (FSM):", headersToSend);
      // console.log("Request Body (FSM):", requestBody);

      const response = await fetch(`http://localhost:8082/consignments/reject?fileName=${fileName}&recordCount=${recordCount}&userId=${userId}`, {
        method: 'POST',
        headers: headersToSend,
        // body: requestBody,
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
    // payload: input.payload,
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
            //req.body
            // payload:  context.payload.map(item => ({
            //   consignment_id: item.consignment_id,
            //   courier: item.courier,
            //   booking_date: item.booking_date,
            //   account_no: item.account_no,
            //   account_title: item.account_title,
            //   receiver_cnic: item.receiver_cnic,
            //   shipping_bill: item.shipping_bill,
            //   address: item.address,
            //   city: item.city,
            //   email: item.email,
            //   mobile_no: item.mobile_no,
            //   letter_type: item.letter_type,
            //   card_no: item.card_no,
            //   card_type: item.card_type,
            //   card_creation_date: item.card_creation_date,
            //   return_reason: item.return_reason,
            //   return_date: item.return_date,
            //   branch_cd: item.branch_cd,
            //   receiver_name_b: item.receiver_name_b,
            //   delivery_date: item.delivery_date,
            //   status: item.status,
            //   receiver_name_d: item.receiver_name_d,
            //   relationship: item.relationship,
            //   card_status: item.card_status,
            //   customer_cnic_number: item.customer_cnic_number,
            // })),
            //queryParams
            queryparams:{
              fileName:context.queryparams.fileName,
              recordCount:context.queryparams.recordCount,
              userId:context.queryparams.userId
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