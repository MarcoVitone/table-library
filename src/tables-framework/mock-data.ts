export interface IMockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "Admin" | "User" | "Editor";
  status: "active" | "inactive" | "pending";
  lastLogin: string;
  age: number;
  department: string;
}

export const MOCK_USERS: IMockUser[] = [
  {
    id: "1",
    firstName: "Mario",
    lastName: "Rossi",
    email: "mario.rossi@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2023-10-25T08:30:00Z",
    age: 34,
    department: "IT",
  },
  {
    id: "2",
    firstName: "Luigi",
    lastName: "Verdi",
    email: "luigi.verdi@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2023-10-20T14:15:00Z",
    age: 28,
    department: "Marketing",
  },
  {
    id: "3",
    firstName: "Anna",
    lastName: "Bianchi",
    email: "anna.bianchi@example.com",
    role: "Editor",
    status: "active",
    lastLogin: "2023-10-26T09:45:00Z",
    age: 42,
    department: "HR",
  },
  {
    id: "4",
    firstName: "Giulia",
    lastName: "Neri",
    email: "giulia.neri@example.com",
    role: "User",
    status: "pending",
    lastLogin: "2023-10-24T11:20:00Z",
    age: 25,
    department: "Sales",
  },
  {
    id: "5",
    firstName: "Paolo",
    lastName: "Gialli",
    email: "paolo.gialli@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2023-10-26T16:00:00Z",
    age: 50,
    department: "Management",
  },
  {
    id: "6",
    firstName: "Francesca",
    lastName: "Viola",
    email: "francesca.viola@example.com",
    role: "Editor",
    status: "active",
    lastLogin: "2023-10-23T10:00:00Z",
    age: 31,
    department: "Content",
  },
  {
    id: "7",
    firstName: "Alessandro",
    lastName: "Marrone",
    email: "alessandro.marrone@example.com",
    role: "User",
    status: "inactive",
    lastLogin: "2023-09-15T09:30:00Z",
    age: 29,
    department: "IT",
  },
  {
    id: "8",
    firstName: "Elena",
    lastName: "Azzurri",
    email: "elena.azzurri@example.com",
    role: "User",
    status: "active",
    lastLogin: "2023-10-25T13:45:00Z",
    age: 37,
    department: "Finance",
  },
  {
    id: "9",
    firstName: "Roberto",
    lastName: "Arancio",
    email: "roberto.arancio@example.com",
    role: "Editor",
    status: "pending",
    lastLogin: "2023-10-26T08:15:00Z",
    age: 45,
    department: "Marketing",
  },
  {
    id: "10",
    firstName: "Chiara",
    lastName: "Rosa",
    email: "chiara.rosa@example.com",
    role: "Admin",
    status: "active",
    lastLogin: "2023-10-26T17:30:00Z",
    age: 39,
    department: "HR",
  },
];
