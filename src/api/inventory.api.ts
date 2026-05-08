import { api } from '@/api/index.api';
import { rtkTags } from '@/constants/rtk-tags';
import type {
  InventoryBooster,
  InventoryChip,
  InventoryChipType,
  InventoryShardCount,
} from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface InventorySnapshot {
  chips: InventoryChip[];
  shards: InventoryShardCount[];
  builders: Record<TicketType, number>;
  boosters: InventoryBooster[];
}

export const inventoryApi = api.injectEndpoints({
  endpoints: builder => ({
    getInventory: builder.query<InventorySnapshot, void>({
      query: () => ({ url: 'inventory' }),
      providesTags: [rtkTags.inventory],
    }),

    equipChip: builder.mutation<InventorySnapshot, { chipId: string; engineId: string }>({
      query: body => ({ url: 'inventory/chip/equip', method: 'POST', body }),
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets],
    }),

    unequipChip: builder.mutation<InventorySnapshot, { chipId: string }>({
      query: body => ({ url: 'inventory/chip/unequip', method: 'POST', body }),
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets],
    }),

    levelUpChip: builder.mutation<InventorySnapshot, { chipId: string }>({
      query: body => ({ url: 'inventory/chip/level-up', method: 'POST', body }),
      invalidatesTags: [rtkTags.inventory],
    }),

    mintChip: builder.mutation<InventorySnapshot, { type: InventoryChipType; quality: TicketType }>(
      {
        query: body => ({ url: 'inventory/chip/mint', method: 'POST', body }),
        invalidatesTags: [rtkTags.inventory],
      }
    ),

    activateBooster: builder.mutation<InventorySnapshot, { boosterId: string; engineId: string }>({
      query: body => ({ url: 'inventory/booster/activate', method: 'POST', body }),
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets],
    }),
  }),
});

export const {
  useGetInventoryQuery,
  useEquipChipMutation,
  useUnequipChipMutation,
  useLevelUpChipMutation,
  useMintChipMutation,
  useActivateBoosterMutation,
} = inventoryApi;
