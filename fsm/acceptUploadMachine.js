import { assign, fromPromise, setup } from 'xstate';
import fetch from 'node-fetch';

export const acceptUploadMachine = setup({
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
      const requestBody = JSON.stringify(
       input.payload
    );

      console.log("Request Headers (FSM):", headersToSend);
      console.log("Request Body (FSM):", requestBody);

      const response = await fetch(`http://localhost:8082/consignments/accept?fileName=${fileName}&recordCount=${recordCount}&userId=${userId}&accept_record_count=${acceptCount}&reject_record_count=${rejectCount}&rejectedRows=${rejectedRows}&acceptedRows=${acceptedRows}&uploadedBy=${uploadedBy}&fileType=${fileType}`, {
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
  id: 'accept',
  initial: 'idle',
  context: ({input})=>({
    payload: input.payload,
    queryparams: input.queryparams,
    authToken:input.authToken,
    result: '',
    error: '',
  }),
  states: {
    idle: {
      on: {
        UPLOAD: {
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
            payload:  context.payload.map(item => ({
              consignment_id: item.consignment_id,
              courier: item.courier,
              booking_date: item.booking_date,
              account_no: item.account_no,
              account_title: item.account_title,
              receiver_cnic: item.receiver_cnic,
              shipping_bill: item.shipping_bill,
              address: item.address,
              city: item.city,
              email: item.email,
              mobile_no: item.mobile_no,
              letter_type: item.letter_type,
              card_no: item.card_no,
              card_type: item.card_type,
              card_creation_date: item.card_creation_date,
              return_reason: item.return_reason,
              return_date: item.return_date,
              return_date_courier: item.return_date_courier,
              branch_cd: item.branch_cd,
              receiver_name_b: item.receiver_name_b,
              delivery_date: item.delivery_date,
              status: item.status,
              receiver_name_d: item.receiver_name_d,
              relationship: item.relationship,
              card_status: item.card_status,
              customer_cnic_number: item.customer_cnic_number,
            })),
            //queryParams
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