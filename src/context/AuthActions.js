export const LoginStart = (userCredentials) => ({
    type:'LOGIN_START',
    payload: userCredentials
});
export const LoginSuccess = (user) => ({
    type:'LOGIN_SUCCESS',
    payload: user,
});
export const LoginFailure = (error) => ({
    type:'LOGIN_FAILURE',
    payload: error
});
export const UpdateUser = (updateUser) => ({
    type:'UPDATE_USER',
    payload: updateUser
});
export const Logout = () => ({
    type:'LOGOUT'
});
export const UpdateBalance = (balance) => ({
    type:'UPDATE_BALANCE',
    payload: balance
});
export const SetLoading = (isLoading) => ({
    type: 'SET_LOADING',
    payload: isLoading,
  });