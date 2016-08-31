export const queryReducer = (state = {}, action) => {
  switch (action.type) {
    case 'STARTING_REQUEST':
      state.fetching = true;
      state.data = action;
      return state;
    case 'FINISHED_REQUEST':
      state.fetching = false;
      state.data = action.response.data.user;
      return state;
    default:
      return state;
  }
};
