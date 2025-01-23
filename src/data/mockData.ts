import { Player, Team } from "../types/auction";

export const mockPlayers: Player[] = [
  {
    id: "1",
    name: "Shakib Al Hasan",
    nationality: "Bangladeshi",
    role: "All-rounder",
    age: 34,
    basePrice: 200000,
    image: "/placeholder.svg",
    status: "Available"
  },
  {
    id: "2",
    name: "David Warner",
    nationality: "Australian",
    role: "Batsman",
    age: 35,
    basePrice: 250000,
    image: "/placeholder.svg",
    status: "Available"
  },
  {
    id: "3",
    name: "Mushfiqur Rahim",
    nationality: "Bangladeshi",
    role: "Wicketkeeper",
    age: 34,
    basePrice: 180000,
    image: "/placeholder.svg",
    status: "Available"
  },
  // Add more players as needed
];

export const mockTeams: Team[] = [
  {
    id: "1",
    name: "Dhaka Dominators",
    logo: "/placeholder.svg",
    players: [],
    budget: 1000000
  },
  {
    id: "2",
    name: "Chittagong Challengers",
    logo: "/placeholder.svg",
    players: [],
    budget: 1000000
  },
  // Add more teams as needed
];