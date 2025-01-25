import { Player } from './player';

export interface Team {
  id: string;
  name: string;
  logo: string | null;
  budget: number;
  created_at: string;
  updated_at: string;
}