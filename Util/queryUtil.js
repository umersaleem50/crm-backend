class customQuery {
  constructor(query) {
    this.query = query;
  }

  // splitQuery() {
  //   this.query = this.query?.split(",")?.join(" ");
  //   return this;
  // }

  filterQuery(...items) {
    let myNewQuery;
    if (!this.query) return this;
    myNewQuery = this.query.split(",");
    this.query = myNewQuery
      .map((el) => {
        if (!items.includes(el)) return el;
      })
      .join(" ")
      .trim();

    return this;
  }
}

module.exports = customQuery;
