class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.queryStr = JSON.stringify(queryStr);

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" "); // in case there is a tie on sorting then sorted by second field name
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createAt");
    }
    return this;
  }

  fieldLimiting() {
    if (this.queryString.fields) {
      let fieldsStr = JSON.stringify(this.queryString.fields); // process of selecting fields called projection
      fieldsStr = fieldsStr.split(",").join(" ");
      this.query = this.query.select(JSON.parse(fieldsStr));
    } else {
      this.query = this.query.select("-__v"); // - __V excludes a certain field from the response being sent to the user.
    }
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
