
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the initial state for the profile
interface UtilState {
  role: string; // You can add more properties if needed, like name, department, etc.
  url:string|null;// this url is used to store the url of the view as intermediate state
}

const initialState: UtilState = {
  role: '', // Initial value set as an empty string
  url: '',
};

// Create the profile slice
const utilSlice = createSlice({
  name: 'util',
  initialState,
  reducers: {
    setRole: (state, action: PayloadAction<string>) => {
      state.role = action.payload;
    },
    setViewUrl: (state, action: PayloadAction<string>) => {
      state.url = action.payload;
    },
  },
});

// Export the action to set the role
export const { setRole ,setViewUrl} = utilSlice.actions;

// Export the reducer to add it to the store
export default utilSlice.reducer;
