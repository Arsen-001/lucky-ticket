import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import { TasksResponse } from '@/types/interfaces/tasks.interfaces';

export const tasksApi = api.injectEndpoints({
  endpoints: builder => ({
    getTasks: builder.query<TasksResponse, void>({
      query: () => ({ url: 'tasks' }),
      providesTags: [rtkTags.tasks],
    }),
  }),
});

export const { useGetTasksQuery } = tasksApi;
