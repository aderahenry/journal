import { createApi, fetchBaseQuery, FetchBaseQueryError, EndpointBuilder } from '@reduxjs/toolkit/query/react';
import { RootState } from './store';
import { setToken } from './slices/authSlice';

export interface Tag {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Entry {
  id: number;
  title: string;
  content: string;
  mood: string;
  categoryId: number | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  wordCount: number;
}

interface EntryStats {
  totalEntries: number;
  totalWords: number;
  avgWordsPerEntry: number;
  tagCount: number;
  moodDistribution: Array<{
    mood: string;
    count: number;
  }>;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
}

type TagTypes = 'Entry' | 'Stats' | 'Category';

type Api = ReturnType<typeof createApi>;

// Define a UserPreferences interface that matches the backend's UserPreferences model
export interface UserPreferencesDTO {
  theme: string;
  defaultView: string;
  emailNotifications: boolean;
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3000/api',
    prepareHeaders: (headers: Headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Entry', 'Stats', 'Category'] as const,
  endpoints: (builder: EndpointBuilder<ReturnType<typeof fetchBaseQuery>, TagTypes, never>) => ({
    login: builder.mutation<{ token: string, message: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.token));
        } catch {}
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        return { message: (response.data as any).error ?? response.data };
      },
    }),

    register: builder.mutation<{ token: string, message: string }, { email: string; password: string }>({
      query: (credentials) => ({
        url: 'auth/register',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setToken(data.token));
        } catch {}
      },
      transformErrorResponse: (response: FetchBaseQueryError) => {
        return { message: (response.data as any).error ?? response.data };
      },
    }),

    getEntries: builder.query<{ entries: Entry[]; total: number }, void>({
      query: () => 'entries',
      providesTags: [{ type: 'Entry' }],
    }),

    getEntry: builder.query<Entry, number>({
      query: (id: number) => `entries/${id}`,
      providesTags: (result: Entry | undefined, error: FetchBaseQueryError | undefined, id: number) => 
        [{ type: 'Entry' as const, id }],
    }),

    createEntry: builder.mutation<Entry, Partial<Entry>>({
      query: (entry: Partial<Entry>) => ({
        url: 'entries',
        method: 'POST',
        body: entry,
      }),
      invalidatesTags: [{ type: 'Entry' }, { type: 'Stats' }],
    }),

    updateEntry: builder.mutation<Entry, { id: number; entry: Partial<Entry> }>({
      query: ({ id, entry }: { id: number; entry: Partial<Entry> }) => ({
        url: `entries/${id}`,
        method: 'PUT',
        body: entry,
      }),
      invalidatesTags: (result: Entry | undefined, error: FetchBaseQueryError | undefined, { id }: { id: number }) => [
        { type: 'Entry' as const, id },
        { type: 'Entry' },
        { type: 'Stats' },
      ],
    }),

    deleteEntry: builder.mutation<void, number>({
      query: (id: number) => ({
        url: `entries/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Entry' }, { type: 'Stats' }],
    }),

    getEntryStats: builder.query<EntryStats, void>({
      query: () => 'entries/stats',
      providesTags: [{ type: 'Stats' }],
    }),

    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
      providesTags: [{ type: 'Category' }],
    }),

    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (category) => ({
        url: 'categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: [{ type: 'Category' }],
    }),

    updateCategory: builder.mutation<Category, { id: number; category: Partial<Category> }>({
      query: ({ id, category }) => ({
        url: `categories/${id}`,
        method: 'PUT',
        body: category,
      }),
      invalidatesTags: [{ type: 'Category' }],
    }),

    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: `categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Category' }, { type: 'Stats' }, { type: 'Entry' }],
    }),

    getUserPreferences: builder.query<UserPreferencesDTO, void>({
      query: () => 'user/preferences',
    }),

    updateUserPreferences: builder.mutation<UserPreferencesDTO, Partial<UserPreferencesDTO>>({
      query: (preferences) => ({
        url: 'user/preferences',
        method: 'PUT',
        body: preferences,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetEntriesQuery,
  useGetEntryQuery,
  useCreateEntryMutation,
  useUpdateEntryMutation,
  useDeleteEntryMutation,
  useGetEntryStatsQuery,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetUserPreferencesQuery,
  useUpdateUserPreferencesMutation,
} = api; 