import { Player } from "@/types/auction";

// Generate random base prices between 50,000 and 500,000
const generateBasePrice = () => Math.floor(Math.random() * (500000 - 50000) + 50000);

export const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Rahim Ahmed",
    nationality: "Bangladeshi",
    role: "Batsman",
    age: 25,
    basePrice: generateBasePrice(),
    status: "Available",
    image: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Liam Carter",
    nationality: "Australian",
    role: "All-rounder",
    age: 29,
    basePrice: generateBasePrice(),
    status: "Available",
    image: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Viraj Sharma",
    nationality: "Indian",
    role: "Bowler",
    age: 23,
    basePrice: generateBasePrice(),
    status: "Available",
    image: "/placeholder.svg"
  },
  {
    id: "4",
    name: "Chris Thompson",
    nationality: "English",
    role: "Wicketkeeper",
    age: 31,
    basePrice: generateBasePrice(),
    status: "Available",
    image: "/placeholder.svg"
  },
  {
    id: "5",
    name: "Arif Hossain",
    nationality: "Bangladeshi",
    role: "Bowler",
    age: 27,
    basePrice: generateBasePrice(),
    status: "Available",
    image: "/placeholder.svg"
  },
  // ... Adding more players following the same pattern
  {
    id: "40",
    name: "Mohammad Nabi",
    nationality: "Afghan",
    role: "All-rounder",
    age: 35,
    basePrice: generateBasePrice(),
    status: "Available",
    image: "/placeholder.svg"
  }
];

export const mockTeams = [
  {
    id: "1",
    name: "Dhaka Dominators",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "2",
    name: "Chittagong Challengers",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "3",
    name: "Sylhet Strikers",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "4",
    name: "Barisal Bulls",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "5",
    name: "Khulna Titans",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "6",
    name: "Rajshahi Royals",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "7",
    name: "Rangpur Riders",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  },
  {
    id: "8",
    name: "Comilla Victorians",
    logo: "/placeholder.svg",
    players: [],
    budget: 10000000
  }
];