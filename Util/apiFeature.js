class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * This method will query the documents based on given set of options
   * @returns return current Object
   */

  filter() {
    const queryObj = { ...this.queryString };
    const excludeEl = ["sort", "limit", "page", "fields", "populate", "search"];
    excludeEl.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  /**
   * This method will sort the results
   * @returns return current Object
   */

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } //USE ELSE TO SORT AUTOMATICALLY BY TIME OF CREATION.

    return this;
  }

  /**
   * This method will return only required fields
   * @returns return current Object
   */

  limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  /**
   * This method will help you have pagination if there is greater number of documents
   * @returns return current Object
   */
  pagination() {
    const page = this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit * 1;
    this.query = this.query.limit(limit).skip(skip);

    return this;
  }
  // populate() {
  //   if (!this.queryString.populate) return this;
  //   this.query = this.query.populate(this.queryString.populate);
  //   return this;
  // }
  search() {
    const search = this.queryString.search;
    if (search) this.query = this.query.find({ $text: { $search: search } });
    return this;
  }
}

module.exports = ApiFeature;
