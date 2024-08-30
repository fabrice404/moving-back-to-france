export const formatResponse = (items: any[], page: number = 1, pages: number = 1, totalItems: number = 1) => {
  return {
    meta: {
      page,
      rows: items.length,
      pages,
      total: totalItems,
    },
    items,
  };
};
