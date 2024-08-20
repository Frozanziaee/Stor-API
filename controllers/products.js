const Product = require('../models/product')

const getAllProductsStatic = async (req, res) => {
    const search = 'a'
    const Products = await Product.find({price: {$gt: 30}})
    .sort('-name')
    .select('name price')
    .limit()
    .skip()
    res.status(200).json({Products, nbHits: Products.length})
}

const getAllProducts = async (req, res) => {
    const {featured, company, name, sort, fields, numericFilters} = req.query
    const queryObject = {}

    if(featured){
        queryObject.featured = featured === 'true'? true: false
    }
    if(company){
        queryObject.company = company
    }
    if(name){
        queryObject.name = {$regex: name, $options: 'i'}
    }
    // if(numericFilters){
    //     console.log(numericFilters)
    // }
    if(numericFilters){
        const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lt',
        }

        const regEx = /\b(<|>|>=|=|<|<=)\b/g
        let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`)
        
        console.log(filters)

        const options = ['price', 'rating']
        filters = filters.split(',').forEach(item => {
            const [field, operator, value] = item.split('-')
            if(options.includes(field)){
                queryObject[field] = {[operator]: Number(value)}
            }
        })
    }

    console.log(queryObject)
    //sort
    let result = Product.find(queryObject)
    if(sort){
        const sortList = sort.split(',').join(' ')
        result = result.sort(sortList)
    }
    else {
      result = result.sort('createAt')  
    }
    if(fields){
        const fieldsList = fields.split(',').join(' ')
        result = result.select(fieldsList)
    }

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    result = result.skip(skip).limit(limit)

    const Products = await result
    res.status(200).json({Products, nbHits: Products.length})
}

module.exports = {
    getAllProducts,
    getAllProductsStatic
}