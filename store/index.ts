import { configureStore } from '@reduxjs/toolkit';
import metadataReducer from './metadataSlice';
import formReducer from './formSlice';
import applicationReducer from './applicationSlice';
import utilReducer from './profile';
import applicationEditReducer from './applicationEdit';


// Create the Redux store by combining reducers
const store = configureStore({
  reducer: {
    metadata: metadataReducer, // Add the metadata slice
    formdata: formReducer, // Add the form slice
    application: applicationReducer,
    util: utilReducer, // Add the profile slice
    applicationEdit: applicationEditReducer,
  },
});

// Export RootState and AppDispatch types for type safety in components
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
