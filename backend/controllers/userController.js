let users = [
  { id: 1, name: "Nhan", email: "nhan222327@student.nctu.edu.vn", createdAt: new Date().toISOString() },
  { id: 2, name: "Phuong", email: "phuong222325@student.nctu.edu.vn", createdAt: new Date().toISOString() },
  { id: 3, name: "Phuc", email: "phuc223245@student.nctu.edu.vn", createdAt: new Date().toISOString() }
];

let nextId = 4;

exports.getUsers = (req, res) => res.json(users);

exports.createUser = (req, res) => {
  const { name, email } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ message: "Name required" });
  if (!email || !/\S+@\S+\.\S+/.test(email)) return res.status(400).json({ message: "Valid email required" });

  const newUser = { id: nextId++, name: name.trim(), email: email.trim(), createdAt: new Date().toISOString() };
  users.push(newUser);
  res.status(201).json(newUser);
};
