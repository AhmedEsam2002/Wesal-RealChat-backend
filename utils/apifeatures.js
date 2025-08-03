import qs from "qs";
export class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const filters = { ...this.queryString };
    const excludeFields = ["sort", "page", "limit", "fields"];
    excludeFields.forEach((el) => delete filters[el]);

    let queryStr = JSON.stringify(qs.parse(filters));
    queryStr = queryStr.replace(
      /"(\b(?:gte|gt|lte|lt)\b)":\s*"?([^"}]+)"?/g,
      (_, op, val) => `"${"$" + op}": ${isNaN(val) ? `"${val}"` : val}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
