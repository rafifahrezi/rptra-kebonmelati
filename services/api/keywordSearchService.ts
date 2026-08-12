import connectDB from '@/lib/mongoose';

export interface SearchResult {
  title: string;
  category: string;
  content: string;
  score: number;
}

export const searchByKeyword = async (query: string, limit: number = 5): Promise<SearchResult[]> => {
  const mongooseInstance = await connectDB();
  const db = mongooseInstance.connection.db;

  if (!db) {
    throw new Error('Database connection is not established');
  }

  // Simple Indonesian Stop Words removal for better keyword extraction
  const stopWords = ['di', 'ke', 'dari', 'yang', 'untuk', 'ini', 'itu', 'pada', 'dan', 'atau', 'dengan', 'adalah', 'sebagai', 'bagaimana', 'apa', 'siapa', 'dimana', 'kapan', 'kenapa', 'bisa', 'ada', 'apakah', 'tolong', 'info', 'beritahu', 'saya', 'kami'];
  
  const keywords = query
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word));
  
  // If query consists solely of stopwords/short words, fallback to original query
  const searchTerms = keywords.length > 0 ? keywords : query.toLowerCase().split(' ').filter(w => w.length > 2);
  
  if (searchTerms.length === 0) {
    // If absolutely no valid terms to search, return empty (e.g. user just typed "di")
    return [];
  }

  const regexPattern = searchTerms.join('|');
  const regex = new RegExp(regexPattern, 'i');

  const results: SearchResult[] = [];

  // Helper function to calculate a simple TF (Term Frequency) score
  const calculateScore = (text: string) => {
    let score = 0;
    const lowerText = text.toLowerCase();
    searchTerms.forEach(term => {
      // Add point for each occurrence of the term in the text
      const occurrences = (lowerText.match(new RegExp(term, 'g')) || []).length;
      score += occurrences;
    });
    return score;
  };

  // 1. Search Events (Jadwal Kegiatan)
  const events = await db.collection('events').find({
    $or: [
      { title: { $regex: regex } },
      { description: { $regex: regex } },
      { category: { $regex: regex } }
    ]
  }).toArray();

  events.forEach(event => {
    const textToScore = `${event.title} ${event.description} ${event.category}`;
    results.push({
      title: event.title,
      category: `Jadwal Kegiatan - ${event.category || 'Event'}`,
      content: `Tanggal: ${event.date} ${event.time}\nLokasi: ${event.location}\nStatus: ${event.status}\nDeskripsi: ${event.description}`,
      score: calculateScore(textToScore)
    });
  });

  // 2. Search News (Berita)
  const news = await db.collection('news').find({
    $or: [
      { title: { $regex: regex } },
      { content: { $regex: regex } },
      { category: { $regex: regex } }
    ]
  }).toArray();

  news.forEach(n => {
    const textToScore = `${n.title} ${n.content} ${n.category}`;
    results.push({
      title: n.title,
      category: `Berita - ${n.category || 'News'}`,
      content: n.content,
      score: calculateScore(textToScore)
    });
  });

  // 3. Search About (Profil, Fasilitas, Aturan - Knowledge Base)
  // Usually collections might be named 'about'
  const aboutDocs = await db.collection('about').find({
    $or: [
      { title: { $regex: regex } },
      { content: { $regex: regex } },
      { category: { $regex: regex } }
    ]
  }).toArray();

  aboutDocs.forEach(doc => {
    const textToScore = `${doc.title} ${doc.content} ${doc.category}`;
    results.push({
      title: doc.title,
      category: `Informasi Profil - ${doc.category || 'Info'}`,
      content: doc.content,
      score: calculateScore(textToScore) * 1.5 // Give slight priority weight to exact knowledge base articles
    });
  });

  // Sort by score (descending) and take top documents
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
};
