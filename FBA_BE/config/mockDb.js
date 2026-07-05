// Mock database module for development without a real database

const mockData = {
  users: [
    { id: 1, name: 'John Doe', email: 'john@example.com', created_at: new Date() },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: new Date() },
  ],
  transactions: [
    { id: 1, user_id: 1, amount: 100, type: 'expense', category: 'food', created_at: new Date() },
    { id: 2, user_id: 1, amount: 50, type: 'income', category: 'salary', created_at: new Date() },
  ],
};

class MockDb {
  table(tableName) {
    return new MockTable(tableName, mockData[tableName] || []);
  }
}

class MockTable {
  constructor(tableName, data) {
    this.tableName = tableName;
    this.data = JSON.parse(JSON.stringify(data)); // deep copy
    this.query = {};
  }

  select(columns = '*') {
    this.query.select = columns;
    return this;
  }

  where(conditions) {
    this.query.where = conditions;
    return this;
  }

  insert(values) {
    const newId = Math.max(...this.data.map(item => item.id || 0)) + 1;
    const newRecord = { id: newId, ...values, created_at: new Date() };
    this.data.push(newRecord);
    return Promise.resolve([newId]);
  }

  update(values) {
    if (this.query.where) {
      this.data = this.data.map(item => {
        let match = true;
        for (let key in this.query.where) {
          if (item[key] !== this.query.where[key]) {
            match = false;
            break;
          }
        }
        return match ? { ...item, ...values } : item;
      });
    }
    return Promise.resolve(this.data.length);
  }

  delete() {
    if (this.query.where) {
      this.data = this.data.filter(item => {
        for (let key in this.query.where) {
          if (item[key] === this.query.where[key]) {
            return false;
          }
        }
        return true;
      });
    }
    return Promise.resolve(this.data.length);
  }

  then(onFulfilled, onRejected) {
    try {
      let result = this.data;

      // Apply select if specified
      if (this.query.select && this.query.select !== '*') {
        result = result.map(item => {
          const selected = {};
          this.query.select.forEach(col => {
            selected[col] = item[col];
          });
          return selected;
        });
      }

      // Apply where if specified
      if (this.query.where) {
        result = result.filter(item => {
          for (let key in this.query.where) {
            if (item[key] !== this.query.where[key]) {
              return false;
            }
          }
          return true;
        });
      }

      return Promise.resolve(result).then(onFulfilled, onRejected);
    } catch (err) {
      return Promise.reject(err).catch(onRejected);
    }
  }

  catch(onRejected) {
    return this.then(undefined, onRejected);
  }
}

module.exports = new MockDb();
