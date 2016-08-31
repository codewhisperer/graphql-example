const startingRequest = () => {
  return {
    type: 'STARTING_REQUEST'
  };
};

const finishedRequest = (response) => {
  return {
    type: 'FINISHED_REQUEST',
    response
  };
};

export const getGraph = (payload) => {
  return dispatch => {
    dispatch(startingRequest());
    return new Promise((resolve) => {
      let request = new XMLHttpRequest();
      request.open('GET', `/graphql?query=${payload}`, true);
      request.setRequestHeader('Content-Type', 'application/graphql');
      request.send(payload);
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          resolve(request.responseText);
        }
      };
    })
    .then(response => dispatch(finishedRequest(JSON.parse(response))));
  };
};
