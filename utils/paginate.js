
    const paginate = async (model, query = {}, reqQuery = {}, options = {} ) => {
    const { page = 1, limit = 6, sort = '-createdAt'} = reqQuery

    const paginateOptions = {
        page: Number(page),
        limit: Number(limit),
        sort,
        ...options
    }
    const result = await model.paginate(query, paginateOptions);
    return {
        data: result.docs,
        meta: {
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages,
            totalDocs: result.totalDocs,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
        }
    }
}

module.exports = paginate

