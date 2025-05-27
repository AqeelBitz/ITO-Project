import { createActor } from "xstate";

export const handler = (machineDefinition, req, res) => {
  console.log(`Handler: Received request for ${req.path}`);

  const actor = createActor(machineDefinition, {
    input: {
      token: req.headers.authorization,
    },
  });
  let responseSent = false;

  actor.subscribe((snapshot) => {
    if (responseSent) return;

    const state = snapshot.value;
    const context = snapshot.context;
    console.log(`Handler: Actor transitioned to state: ${state}`);

    if (snapshot.matches('loggedIn')) {
      console.log("Handler (loggedIn): Context:", context);
      res.status(200).json({
        message: 'Login successful',
        data: context.userData
      });
      responseSent = true;
      actor.stop();
    } else if (snapshot.matches('loginFailed')) {
      console.log("Handler (loginFailed): Context:", context);
      res.status(401).json({
        message: 'Login failed',
        error: context.errorMessage
      });
      responseSent = true;
      actor.stop();
    }

    else if (snapshot.matches('success')) {
      console.log("Handler (success): Context:", context);
      console.log("context: ", context);
      res.status(200).json({
        message: 'Search successful',
        data: context.results
      });
      responseSent = true;
      actor.stop();
    } else if (snapshot.matches('searchFailed')) {
      console.log("Handler (searchFailed): Context:", context);
      res.status(400).json({
        message: 'Search failed',
        error: context.errorMessage
      });
      responseSent = true;
      actor.stop();
    } else if (snapshot.matches('noResults')) {
      console.log("Handler (noResults): Context:", context);
      res.status(404).json({
        message: 'No record found for the given query.',
        error: context.errorMessage
      });
      responseSent = true;
      actor.stop();
    }

    else if (snapshot.matches('idle')) {
      console.log('Handler: State is idle. Waiting for SUBMIT...');
      console.log("Handler (idle): Context:", context);
    } else if (snapshot.matches('searching') || snapshot.matches('loggingIn')) {
      console.log(`Handler: State is ${state}. Waiting for invoke result...`);
      console.log(`Handler (${state}): Context:`, context);
    }
  });

  actor.subscribe({
    next: (state) => {
    },
    error: (err) => {
      console.error("Handler: Actor internal error:", err);
      if (!responseSent) {
        res.status(500).json({ message: "Internal server error during FSM process." });
        responseSent = true;
      }
      actor.stop();
    }
  });

  const input = req.method === 'GET'
    ? { query: req } : req.body;

  const token = req.headers.authorization;

  console.log('Handler: Starting actor...');
  actor.start();
  actor.send({ type: 'SUBMIT', input: input, token: token });
};