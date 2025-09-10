const categoriesTree = (categories: any[], parentId: string = "") => {
  const tree: any[] = [];

  categories.forEach((item) => {
    const parentIds = Array.isArray(item.parentCategoryId)
      ? item.parentCategoryId.map((id: any) => id.toString())
      : [];

    const itemId = item._id?.toString?.() || item.id?.toString();

    // root (không có cha) hoặc con của parentId hiện tại
    if ((parentIds.length === 0 && parentId === "") || parentIds.includes(parentId)) {
      // tránh tự tham chiếu
      // if (itemId === parentId){
      //   console.log(itemId);
      //   console.log(parentId);
      //   return;
      // };
        

      const children = categoriesTree(categories, itemId);

      tree.push({
        id: itemId,
        name: item.name,
        image: item.image || "",
        status: item.status,
        parentCategoryId: parentIds,
        createdAtFormat: item.createdAtFormat,
        updatedAtFormat: item.updatedAtFormat,
        children,
      });
    }
  });

  return tree;
};

export default categoriesTree;

export const getAllChildrenCategory:any = (categoryId:string, categories:any[], path:any = []) => {
  const getCategory = categories.find(c => c.parentCategoryId.includes(categoryId));

  if(!getCategory) {
    return [...path, categoryId];
  }

  let categoryArray = [...path, categoryId];

  return getAllChildrenCategory(getCategory.id, categories, categoryArray);
}
