import type { IUser } from "./IUser";


export class User implements IUser {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public createdAt: Date = new Date()
  ) {}

  static users: User[] = [
    new User(1, 'John Doe', 'john@example.com'),
    new User(2, 'Jane Smith', 'jane@example.com'),
  ];

  static getAll(): User[] {
    return this.users;
  }

  static getById(id: number): User | undefined {
    return this.users.find(user => user.id === id);
  }

  static create(name: string, email: string): User {
    const newUser = new User(
      this.users.length + 1,
      name,
      email
    );
    this.users.push(newUser);
    return newUser;
  }

  static update(id: number, name: string, email: string): User | undefined {
    const user = this.getById(id);
    if (user) {
      user.name = name;
      user.email = email;
    }
    return user;
  }

  static delete(id: number): boolean {
    const index = this.users.findIndex(user => user.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
