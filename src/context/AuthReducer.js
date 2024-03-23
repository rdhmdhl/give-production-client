const AuthReducer = (state, action) => {
    switch(action.type){
        case 'SET_LOADING':
            return {
              ...state,
              isLoading: action.payload,
            };
        case "LOGIN_START":
            return { 
                ...state, 
                user: action.payload, 
                token: action.token, 
                isFetching: false, 
                error: false 
            };
        case "LOGIN_SUCCESS":
            return{
                user: action.payload,
                isFetching: false,
                error: false,
            };
        case "LOGIN_FAILURE":
            return{
                user: null,
                isFetching: false,
                error: action.payload,
            };
        case "SET_SOCKET":
            console.log("set_socket called in auth reducer");
            return{
                ...state,
                socket_context: action.payload,
            };
        case "REMOVE_SOCKET":   
            return{
                ...state,
                socket_context: null,
            };
        case "UPDATE_USER":
            return{
                ...state, user: { ...action.payload }
            };
        case "LOGOUT":
            return{
                user: null,
                isFetching: false,
                error: false,
            };
        case 'UPDATE_BALANCE':
        return {
            ...state,
            balance: action.payload,
        };
            default:
                return state
    }

};

export default AuthReducer;