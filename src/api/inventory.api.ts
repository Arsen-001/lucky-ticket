import { api } from '@/api/index.api';
import { balanceTags } from '@/api/balance-tags';
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

    /*
     * Both slot mutations spend Lucky Stars server-side (DOCS §10.4: attach
     * costs the chip's level, detach half of it rounded up, a move pays both),
     * so the whole Stars group refreshes — the header pill, /stars and its
     * ledger, and the wallet's `starsBalance`. The price the screens quote comes
     * from `chipSlotStarsCost`, which mirrors the service's own formula.
     */
    equipChip: builder.mutation<InventorySnapshot, { chipId: string; engineId: string }>({
      query: body => ({ url: 'inventory/chip/equip', method: 'POST', body }),
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets, ...balanceTags.stars],
    }),

    unequipChip: builder.mutation<InventorySnapshot, { chipId: string }>({
      query: body => ({ url: 'inventory/chip/unequip', method: 'POST', body }),
      invalidatesTags: [rtkTags.inventory, rtkTags.tickets, ...balanceTags.stars],
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
