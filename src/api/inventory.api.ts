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
      // `me` because this charges Lucky Stars server-side: without it the
      // header balance and the equip modal's own `userStars / cost` gate both
      // kept the pre-purchase number, so a second equip was armed against a
      // balance the server no longer agreed with.
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets, rtkTags.me],
    }),

    unequipChip: builder.mutation<InventorySnapshot, { chipId: string }>({
      query: body => ({ url: 'inventory/chip/unequip', method: 'POST', body }),
      // `me` because this charges Lucky Stars server-side: without it the
      // header balance and the equip modal's own `userStars / cost` gate both
      // kept the pre-purchase number, so a second equip was armed against a
      // balance the server no longer agreed with.
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets, rtkTags.me],
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
