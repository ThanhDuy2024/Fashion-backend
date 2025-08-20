export const pagination = (countDocuments:number, page = 1, skip = 0, limit = 2) => {
  const totalPage = Math.ceil(countDocuments / limit);
  if(page < 1 || page > totalPage) {
    page = 1;
  } 

  skip = (page - 1) * limit;


  return {
    totalPage: totalPage,
    skip: skip,
    limit: limit,
  }
}