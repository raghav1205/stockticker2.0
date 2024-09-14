import { createSlice } from '@reduxjs/toolkit';


const initialState: any = {
    data: []
};


const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state, action) {
            Object.keys(action.payload).forEach((key: string) => {
               
                const stockObj = { [key]: action.payload[key] }
                if (!state.data.some((item: any) => Object.keys(item)[0] === key)) {
                    state.data = [...state.data, stockObj];
                }
                
            });

            // console.log(state.data);
            // console.log('setData');
        }

    }
});


export const { setData } = dataSlice.actions;
export default dataSlice.reducer;