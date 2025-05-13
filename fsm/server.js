import express from 'express';
import { createActor } from 'xstate';
import { appMachine } from './loginMachine.js';
import {acceptUploadMachine} from './acceptUploadMachine.js'
import {rejectUploadMachine} from './rejectUploadMachine.js'
import { handler } from './handler.js';
import { searchMachine } from "./searchMachine.js";
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.post('/fsm/login', async (req, res) => {
  const {username, password, branchCd} = req.body;
  console.log("Username: ", username,"passwrod: ", password,"branchCiode: ", branchCd);

  const actor = createActor(appMachine, {
    input: {
      payload: {
        username: username,
        password: password,
        branchCd: branchCd
      }
      ,
        result: null,
        error: null
    }

  });

  actor.subscribe((state) => {
    console.log(state.value);
    if (state.matches('success')) {
      res.status(200).json(state.context.result);
      actor.stop();
    } else if (state.matches('failure')) {
      console.error("Login Failed - Error:", state.context.error); // Log the error
      res.status(401).json({ error: state.context.error });
      actor.stop();
    }
  });

  actor.start();
  actor.send({ type: 'SUBMIT' });
});
app.post('/fsm/consignments/accept', async (req, res) => {
  
  console.log("----------->   inside upload post")
  const fileName = req.query.fileName;
  const recordCount = parseInt(req.query.recordCount);
  const userId = parseInt(req.query.userId);
  const accept_record_count = parseInt(req.query.accept_record_count);
  const reject_record_count = parseInt(req.query.reject_record_count);
  const rejectedRows = req.query.rejectedRows;
  const acceptedRows = req.query.acceptedRows;
  const uploadedBy = req.query.uploadedBy;
  const fileType = req.query.fileType;
  const authToken = req.headers.authorization;
  // console.log("AuthToken: ",AuthToken.authorization)
  // console.log("Header: ",AuthToken)
  

  // console.log("----> request body: ", req.body);
  const allConsginment = req.body;

  const app = express();
  app.use(express.json());
  console.log("------> recordCount type: ",typeof(recordCount));
  console.log("------> userId type: ",typeof(userId));
  
  const payload = allConsginment.map(consignment => ({
    consignment_id: consignment.consignment_id,
    courier: consignment.courier,
    booking_date: consignment.booking_date,
    account_no: consignment.account_no,
    account_title: consignment.account_title,
    receiver_cnic: consignment.receiver_cnic, 
    shipping_bill: consignment.shipping_bill,
    address: consignment.address,
    city: consignment.city,
    email: consignment.email,
    mobile_no: consignment.mobile_no,
    letter_type: consignment.letter_type,
    card_no: consignment.card_no,
    card_type: consignment.card_type,
    card_creation_date: consignment.card_creation_date,
    return_reason: consignment.return_reason, 
    return_date: consignment.return_date,
    branch_cd: consignment.branch_cd, 
    receiver_name_b: consignment.receiver_name_b,
    delivery_date: consignment.delivery_date,
    status: consignment.status, 
    receiver_name_d: consignment.receiver_name_d, 
    relationship: consignment.relationship, 
    card_status: consignment.card_status, 
    customer_cnic_number: consignment.customer_cnic_number
  }));


  const actor = createActor(acceptUploadMachine, {
    input: {
      queryparams: {
        fileName:fileName,
        recordCount:recordCount,
        userId:userId,
        acceptCount:accept_record_count,
        rejectCount:reject_record_count,
        rejectedRows:rejectedRows,
        acceptedRows:acceptedRows,
        uploadedBy:uploadedBy,
        fileType:fileType
      },
      payload:payload,
        result: null,
        error: null,
        authToken:authToken
    }

  });

  actor.subscribe((state) => {
    console.log(state.value);
    if (state.matches('success')) {
      res.status(200).json(state.context.result);
      actor.stop();
    } else if (state.matches('failure')) {
      console.error("Login Failed - Error:", state.context.error); // Log the error
      res.status(401).json({ error: state.context.error });
      actor.stop();
    }
  });

  actor.start();
  actor.send({ type: 'UPLOAD' });
});

app.post('/fsm/consignments/reject', async (req, res) => {
  
  console.log("----------->   inside upload post")
  const fileName = req.query.fileName;
  const recordCount = parseInt(req.query.recordCount);
  const userId = parseInt(req.query.userId);
  const accept_record_count = parseInt(req.query.accept_record_count);
  const reject_record_count = parseInt(req.query.reject_record_count);
  const rejectedRows = req.query.rejectedRows;
  const acceptedRows = req.query.acceptedRows;
  const uploadedBy = req.query.uploadedBy;
  const fileType = req.query.fileType;
  const authToken = req.headers.authorization;
  console.log("params: ", req.query);
  console.log("------> recordCount type: ",typeof(recordCount));
  console.log("------> userId type: ",typeof(userId));

  const actor = createActor(rejectUploadMachine, {
    input: {
      queryparams: {
        fileName:fileName,
        recordCount:recordCount,
        userId:userId,
        acceptCount:accept_record_count,
        rejectCount:reject_record_count,
        rejectedRows:rejectedRows,
        acceptedRows:acceptedRows,
        uploadedBy:uploadedBy,
        fileType:fileType
      },
        result: null,
        error: null,
        authToken:authToken
    }

  });

  actor.subscribe((state) => {
    console.log(state.value);
    if (state.matches('success')) {
      res.status(200).json(state.context.result);
      actor.stop();
    } else if (state.matches('failure')) {
      console.error("Login Failed - Error:", state.context.error); // Log the error
      res.status(401).json({ error: state.context.error });
      actor.stop();
    }
  });

  actor.start();
  actor.send({ type: 'REJECT' });
});

app.get("/fsm/consignments/search",
  async (req, res) => {
    const authToken = req.headers.authorization;
    const queryparams = req.query;
    console.log("authToken: ",authToken )
    console.log("req.query: ",req.query )
    const actor = createActor(searchMachine, {
      input: {
        queryparams: queryparams,
          result: null,
          error: null,
          authToken:authToken
      }
      
    });
  
    actor.subscribe((state) => {
      console.log(state.value);
      if (state.matches('success')) {
        res.status(200).json(state.context.result);
        actor.stop();
      } else if (state.matches('searchFailed')) {
        console.error("Login Failed - Error:", state.context.error); 
        res.status(200).json({ error: state.context.error });
        actor.stop();
      }
    });
  
    actor.start();
    actor.send({ type: 'SUBMIT'});
  });

app.listen(3001, () => {
  console.log('FSM Server running at http://localhost:3001');
});