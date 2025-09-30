import { create } from "zustand";

export const useTableSelectionStore = create((set, get) => ({
  // Separate state for each table type
  products: {
    selectedItems: new Set(),
    selectAll: false,
  },
  collections: {
    selectedItems: new Set(),
    selectAll: false,
  },
  coupons: {
    selectedItems: new Set(),
    selectAll: false,
  },

  // Generic actions that work with any table
  toggleItem: (table, itemId) =>
    set((state) => {
      const newSelected = new Set(state[table].selectedItems);
      if (newSelected.has(itemId)) {
        newSelected.delete(itemId);
      } else {
        newSelected.add(itemId);
      }
      return {
        [table]: {
          ...state[table],
          selectedItems: newSelected,
        },
      };
    }),

  toggleSelectAll: (table, itemIds) =>
    set((state) => {
      const allSelected = itemIds.every((id) =>
        state[table].selectedItems.has(id)
      );
      if (allSelected) {
        return {
          [table]: {
            selectedItems: new Set(),
            selectAll: false,
          },
        };
      } else {
        return {
          [table]: {
            selectedItems: new Set(itemIds),
            selectAll: true,
          },
        };
      }
    }),

  clearSelection: (table) =>
    set((state) => ({
      [table]: {
        selectedItems: new Set(),
        selectAll: false,
      },
    })),

  initializeSelection: (table, itemIds) =>
    set((state) => ({
      [table]: {
        selectedItems: new Set(itemIds),
        selectAll: false,
      },
    })),

  getSelectedCount: (table) => get()[table].selectedItems.size,
  isSelected: (table, itemId) => get()[table].selectedItems.has(itemId),
  getSelectedItems: (table) => Array.from(get()[table].selectedItems),
}));

// Helper hooks for cleaner usage
export const useProductTableStore = () => {
  const store = useTableSelectionStore();
  return {
    selectedItems: store.products.selectedItems,
    selectAll: store.products.selectAll,
    toggleItem: (itemId) => store.toggleItem("products", itemId),
    toggleSelectAll: (itemIds) => store.toggleSelectAll("products", itemIds),
    clearSelection: () => store.clearSelection("products"),
    initializeSelection: (itemIds) =>
      store.initializeSelection("products", itemIds),
    getSelectedCount: () => store.getSelectedCount("products"),
    isSelected: (itemId) => store.isSelected("products", itemId),
    getSelectedItems: () => store.getSelectedItems("products"),
  };
};

export const useCollectionTableStore = () => {
  const store = useTableSelectionStore();
  return {
    selectedItems: store.collections.selectedItems,
    selectAll: store.collections.selectAll,
    toggleItem: (itemId) => store.toggleItem("collections", itemId),
    toggleSelectAll: (itemIds) => store.toggleSelectAll("collections", itemIds),
    clearSelection: () => store.clearSelection("collections"),
    getSelectedCount: () => store.getSelectedCount("collections"),
    isSelected: (itemId) => store.isSelected("collections", itemId),
    getSelectedItems: () => store.getSelectedItems("collections"),
  };
};

export const useCouponTableStore = () => {
  const store = useTableSelectionStore();
  return {
    selectedItems: store.coupons.selectedItems,
    selectAll: store.coupons.selectAll,
    toggleItem: (itemId) => store.toggleItem("coupons", itemId),
    toggleSelectAll: (itemIds) => store.toggleSelectAll("coupons", itemIds),
    clearSelection: () => store.clearSelection("coupons"),
    getSelectedCount: () => store.getSelectedCount("coupons"),
    isSelected: (itemId) => store.isSelected("coupons", itemId),
    getSelectedItems: () => store.getSelectedItems("coupons"),
  };
};
