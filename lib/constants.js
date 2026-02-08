export const PER_PAGE = 10;

// Product sorting options
export const PRODUCT_SORT_OPTIONS = {
  newest: { column: "created_at", ascending: false, label: "Newest First" },
  "name-asc": { column: "name", ascending: true, label: "Alphabetically A-Z" },
  "name-desc": {
    column: "name",
    ascending: false,
    label: "Alphabetically Z-A",
  },
  "price-asc": {
    column: "base_price",
    ascending: true,
    label: "Price: Low to High",
  },
  "price-desc": {
    column: "base_price",
    ascending: false,
    label: "Price: High to Low",
  },
};

export const DEFAULT_PRODUCT_SORT = "newest";

// User sorting options
export const USER_SORT_OPTIONS = {
  newest: { column: "created_at", ascending: false, label: "Newest First" },
  oldest: { column: "created_at", ascending: true, label: "Oldest First" },
  "name-asc": { column: "first_name", ascending: true, label: "Name A-Z" },
  "name-desc": { column: "first_name", ascending: false, label: "Name Z-A" },
};

export const DEFAULT_USER_SORT = "newest";

export const USER_ROLE_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "admin", label: "Admins Only" },
  { value: "customer", label: "Customers Only" },
];

export const COUNTRIES = [
  { value: "Cambodia", label: "Cambodia (កម្ពុជា)", code: "KH" },
  // Future: Thailand, Vietnam, etc.
];

export const CAMBODIA_PROVINCES = [
  // Capital/Autonomous Municipality
  { value: "Phnom Penh", label: "Phnom Penh (ភ្នំពេញ)" },

  // Major Cities/Provinces (alphabetical)
  { value: "Banteay Meanchey", label: "Banteay Meanchey (បន្ទាយមានជ័យ)" },
  { value: "Battambang", label: "Battambang (បាត់ដំបង)" },
  { value: "Kampong Cham", label: "Kampong Cham (កំពង់ចាម)" },
  { value: "Kampong Chhnang", label: "Kampong Chhnang (កំពង់ឆ្នាំង)" },
  { value: "Kampong Speu", label: "Kampong Speu (កំពង់ស្ពឺ)" },
  { value: "Kampong Thom", label: "Kampong Thom (កំពង់ធំ)" },
  { value: "Kampot", label: "Kampot (កំពត)" },
  { value: "Kandal", label: "Kandal (កណ្តាល)" },
  { value: "Kep", label: "Kep (កែប)" },
  { value: "Koh Kong", label: "Koh Kong (កោះកុង)" },
  { value: "Kratié", label: "Kratié (ក្រចេះ)" },
  { value: "Mondulkiri", label: "Mondulkiri (មណ្ឌលគិរី)" },
  { value: "Oddar Meanchey", label: "Oddar Meanchey (ឧត្តរមានជ័យ)" },
  { value: "Pailin", label: "Pailin (ប៉ៃលិន)" },
  { value: "Preah Sihanouk", label: "Preah Sihanouk (ព្រះសីហនុ)" },
  { value: "Preah Vihear", label: "Preah Vihear (ព្រះវិហារ)" },
  { value: "Prey Veng", label: "Prey Veng (ព្រៃវែង)" },
  { value: "Pursat", label: "Pursat (ពោធិ៍សាត់)" },
  { value: "Ratanakiri", label: "Ratanakiri (រតនគិរី)" },
  { value: "Siem Reap", label: "Siem Reap (សៀមរាប)" },
  { value: "Stung Treng", label: "Stung Treng (ស្ទឹងត្រែង)" },
  { value: "Svay Rieng", label: "Svay Rieng (ស្វាយរៀង)" },
  { value: "Takéo", label: "Takéo (តាកែវ)" },
  { value: "Tboung Khmum", label: "Tboung Khmum (ត្បូងឃ្មុំ)" },
];
