export interface Mission {
  title: string;
  description: string;
  image: string;
}

export interface Vision {
  title: string;
  description: string;
}

export interface Values {
  title: string;
  description: string;
}

export interface Program {
  id?: string;
  name: string;
  title: string;
  description: string;
}

export interface Facility {
  id?: string;
  name: string;
  title: string;
  description: string;
  images?: string[];
}

export interface Partner {
  name: string;
  role: string;
}

export interface Collaboration {
  title: string;
  description: string;
  partners: Partner[];
}

export interface OperationalHours {
  senin: string;
  selasa: string;
  rabu: string;
  kamis: string;
  jumat: string;
  sabtu: string;
  minggu: string;
}

export interface Operational {
  title: string;
  hours: OperationalHours;
}

export interface AboutData {
  title: string;
  subtitle: string;
  mission: Mission;
  vision: Vision;
  values: Values;
  programs: {
    title: string;
    description: string;
    items: Program[];
  };
  facilities: {
    title: string;
    description: string;
    items: Facility[];
    images: string[];
  };
  collaborations: Collaboration;
  operational: Operational;
  establishedYear: string; 
  establishedText: string;
  lastUpdated: string;
}
