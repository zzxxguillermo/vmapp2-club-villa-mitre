import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Cupon, BaseListState, CategoriasCupon, CuponesState } from '../../types';
import { cuponesService } from '../../services';

// Async thunks
export const fetchCupones = createAsyncThunk<Cupon[]>(
  'cupones/fetchCupones',
  async (_, { rejectWithValue }) => {
    try {
      const cupones = await cuponesService.getAll();
      return cupones;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar cupones');
    }
  }
);

export const fetchCuponById = createAsyncThunk<Cupon, string>(
  'cupones/fetchCuponById',
  async (id, { rejectWithValue }) => {
    try {
      const cupon = await cuponesService.getById(id);
      return cupon;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar cupón');
    }
  }
);

export const fetchCategorias = createAsyncThunk<CategoriasCupon[]>(
  'cupones/fetchCategorias',
  async (_, { rejectWithValue }) => {
    try {
      const categorias = await cuponesService.getCategorias();
      return categorias;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Error al cargar categorías');
    }
  }
);

// Initial state
const initialState: CuponesState = {
  items: [],
  categoriaSeleccionada: null,
  loading: false,
  error: null,
};

// Slice
const cuponesSlice = createSlice({
  name: 'cupones',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCategoriaSeleccionada: (state, action: PayloadAction<string | null>) => {
      state.categoriaSeleccionada = action.payload;
    },
    clearCategoriaSeleccionada: (state) => {
      state.categoriaSeleccionada = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all cupones
      .addCase(fetchCupones.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCupones.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchCupones.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch cupon by id
      .addCase(fetchCuponById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCuponById.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchCuponById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCategoriaSeleccionada, clearCategoriaSeleccionada } =
  cuponesSlice.actions;
export default cuponesSlice.reducer;
