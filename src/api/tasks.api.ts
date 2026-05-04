import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  ClaimTaskRequest,
  ClaimTaskResponse,
  TaskReward,
  TasksResponse,
} from '@/types/interfaces/tasks.interfaces';

export const tasksApi = api.injectEndpoints({
  endpoints: builder => ({
    getTasks: builder.query<TasksResponse, void>({
      query: () => ({ url: 'tasks' }),
      providesTags: [rtkTags.tasks],
    }),
    claimTask: builder.mutation<ClaimTaskResponse, ClaimTaskRequest>({
      query: body => ({ url: 'tasks/claim', method: 'POST', body }),
      invalidatesTags: [rtkTags.tasks, rtkTags.wallet, rtkTags.me],
    }),
    watchAd: builder.mutation<{ adId: string; rewards: TaskReward[] }, { adId: string }>({
      query: body => ({ url: 'tasks/ads/watch', method: 'POST', body }),
      invalidatesTags: [rtkTags.tasks, rtkTags.wallet],
    }),
  }),
});

export const { useGetTasksQuery, useClaimTaskMutation, useWatchAdMutation } = tasksApi;
