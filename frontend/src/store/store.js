import { configureStore } from '@reduxjs/toolkit';
import jobReducer from "./slices/jobSlice";
import userReducer from  "./slices/userSlice";
import applicationReducer from  "./slices/applicationSlice";
import updateProfileSlice from './slices/updateProfileSlice';


export const store = configureStore({
  reducer: {
    user : userReducer,
    jobs: jobReducer,
    applications : applicationReducer,
    updateProfile: updateProfileSlice,
  },
})

export default store;
