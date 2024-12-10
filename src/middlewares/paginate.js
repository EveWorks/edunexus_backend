const paginate = async function (options) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;
  
    // Fetch the rows and the total count
    const { rows, count } = await this.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']], // Sort by ID, adjust as needed
    });
  
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
  
    return {
      data: rows,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  };

  module.exports=paginate