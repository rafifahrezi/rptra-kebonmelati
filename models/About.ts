import mongoose, { Schema, Document } from 'mongoose';

export interface IAbout extends Document {
  _id: string; // Fixed ID 'main'
  title: string;
  subtitle: string;
  mission: {
    title: string;
    description: string;
    image: string;
  };
  vision: {
    title: string;
    description: string;
  };
  values: {
    title: string;
    description: string;
  };
  programs: {
    title: string;
    description: string;
    items: { name: string; description: string }[];
  };
  facilities: {
    title: string;
    description: string;
    items: { name: string; description: string; }[];
    images: string[]
  };
  collaborations: {
    title: string;
    description: string;
    partners: { name: string; role: string }[];
  };
  operational: {
    title: string;
    hours: {
      senin: string;
      selasa: string;
      rabu: string;
      kamis: string;
      jumat: string;
      sabtu: string;
      minggu: string;
    };
  };
  establishedYear: string;
  establishedText: string;
  lastUpdated: Date;
}

const aboutSchema = new Schema<IAbout>(
  {
    _id: { type: String, required: true, default: 'main' },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    mission: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      image: { type: String, default: '' },
    },
    vision: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    values: {
      title: { type: String, required: true },
      description: { type: String, required: true },
    },
    programs: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      items: [{ name: { type: String, required: true }, description: { type: String, required: true } }],
    },
    facilities: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      items: [{ name: String, description: String }],
      images: [{ type: String }], // Ensured as array
    },
    collaborations: {
      title: { type: String, required: true },
      description: { type: String, required: true },
      partners: [{ name: { type: String, required: true }, role: { type: String, required: true } }],
    },
    operational: {
      title: { type: String, required: true },
      hours: {
        senin: { type: String, required: true },
        selasa: { type: String, required: true },
        rabu: { type: String, required: true },
        kamis: { type: String, required: true },
        jumat: { type: String, required: true },
        sabtu: { type: String, required: true },
        minggu: { type: String, required: true },
      },
    },
    establishedYear: { type: String, required: true },
    establishedText: { type: String, required: true },
    lastUpdated: { type: Date, required: true, default: Date.now },
  },
  {
    collection: 'about',
  }
);

const About = mongoose.models.About || mongoose.model<IAbout>('About', aboutSchema, 'about');

export default About;
