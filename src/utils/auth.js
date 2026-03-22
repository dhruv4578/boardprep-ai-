export const AUTH_KEYS = {
  USERS: 'BOARD_PREP_USERS',
  CURRENT_USER: 'BOARD_PREP_CURRENT_USER'
};

export function getUsers() {
  const users = localStorage.getItem(AUTH_KEYS.USERS);
  return users ? JSON.parse(users) : [];
}

export function getCurrentUser() {
  const user = localStorage.getItem(AUTH_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
}

export function login(username, password) {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false, error: 'Invalid username or password' };
}

export function signup(name, username, password) {
  const users = getUsers();
  if (users.some(u => u.username === username)) {
    return { success: false, error: 'Username already exists' };
  }
  const newUser = { name, username, password, createdAt: new Date().toISOString() };
  users.push(newUser);
  localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(newUser));
  return { success: true, user: newUser };
}

export function logout() {
  localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
}
