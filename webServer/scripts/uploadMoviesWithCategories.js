const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const ADMIN_EMAIL = "tal@gmail.com";
const ADMIN_PASSWORD = "123456";

// Categories to create
const categoriesToCreate = [
  { name: 'Action', promoted: true },
  { name: 'Drama', promoted: true },
  { name: 'Thriller', promoted: true },
  { name: 'Crime', promoted: true },
  { name: 'Sci-Fi', promoted: true },
  { name: 'Romance', promoted: true },
  { name: 'Comedy', promoted: true },
  { name: 'Adventure', promoted: true },
  { name: 'Fantasy', promoted: true },
  { name: 'Biography', promoted: true },
  { name: 'Mystery', promoted: true },
  { name: 'War', promoted: true }
];

const movieData = [
  {
    name: "The Dark Knight",
    duration: 152,
    year: 2008,
    description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    trailer: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    mainImage: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    movieFile: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
    categories: ["Action", "Crime", "Drama"]
  },
  {
    name: "Inception",
    duration: 148,
    year: 2010,
    description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Ellen Page", "Tom Hardy"],
    trailer: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    mainImage: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    movieFile: "https://www.youtube.com/watch?v=YoHD9XEInc0",
    categories: ["Action", "Sci-Fi", "Thriller"]
  },
  {
    name: "Pulp Fiction",
    duration: 154,
    year: 1994,
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
    director: "Quentin Tarantino",
    cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson", "Bruce Willis"],
    trailer: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    mainImage: "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
    movieFile: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
    categories: ["Crime", "Drama"]
  },
  {
    name: "The Shawshank Redemption",
    duration: 142,
    year: 1994,
    description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    director: "Frank Darabont",
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    trailer: "https://www.youtube.com/watch?v=6hB3S9bIaco",
    mainImage: "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    movieFile: "https://www.youtube.com/watch?v=6hB3S9bIaco",
    categories: ["Drama"]
  },
  {
    name: "Fight Club",
    duration: 139,
    year: 1999,
    description: "An insomniac office worker and a devil-may-care soapmaker form an underground fight club that evolves into something much, much more.",
    director: "David Fincher",
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter"],
    trailer: "https://www.youtube.com/watch?v=qtRKdVHc-cE",
    mainImage: "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
    movieFile: "https://www.youtube.com/watch?v=qtRKdVHc-cE",
    categories: ["Drama", "Thriller"]
  },
  {
    name: "The Matrix",
    duration: 136,
    year: 1999,
    description: "A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.",
    director: "The Wachowskis",
    cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss", "Hugo Weaving"],
    trailer: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    mainImage: "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
    movieFile: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
    categories: ["Action", "Sci-Fi"]
  },
  {
    name: "Interstellar",
    duration: 169,
    year: 2014,
    description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    director: "Christopher Nolan",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    trailer: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    mainImage: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    movieFile: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
    categories: ["Sci-Fi", "Drama", "Adventure"]
  },
  {
    name: "The Godfather",
    duration: 175,
    year: 1972,
    description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    director: "Francis Ford Coppola",
    cast: ["Marlon Brando", "Al Pacino", "James Caan", "Diane Keaton"],
    trailer: "https://www.youtube.com/watch?v=sY1S34973zA",
    mainImage: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    movieFile: "https://www.youtube.com/watch?v=sY1S34973zA",
    categories: ["Crime", "Drama"]
  },
  {
    name: "Goodfellas",
    duration: 146,
    year: 1990,
    description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.",
    director: "Martin Scorsese",
    cast: ["Robert De Niro", "Ray Liotta", "Joe Pesci", "Lorraine Bracco"],
    trailer: "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
    mainImage: "https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
    movieFile: "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
    categories: ["Crime", "Drama", "Biography"]
  },
  {
    name: "The Lord of the Rings: The Fellowship",
    duration: 178,
    year: 2001,
    description: "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    director: "Peter Jackson",
    cast: ["Elijah Wood", "Ian McKellen", "Orlando Bloom", "Sean Bean"],
    trailer: "https://www.youtube.com/watch?v=V75dMMIW2B4",
    mainImage: "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
    movieFile: "https://www.youtube.com/watch?v=V75dMMIW2B4",
    categories: ["Adventure", "Fantasy", "Action"]
  },
  {
    name: "Avatar",
    duration: 162,
    year: 2009,
    description: "A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
    director: "James Cameron",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Michelle Rodriguez"],
    trailer: "https://www.youtube.com/watch?v=5PSNL1qE6VY",
    mainImage: "https://image.tmdb.org/t/p/w500/6EiRUJpuoeQPghrs3YNktfnqOVh.jpg",
    movieFile: "https://www.youtube.com/watch?v=5PSNL1qE6VY",
    categories: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    name: "Titanic",
    duration: 194,
    year: 1997,
    description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
    director: "James Cameron",
    cast: ["Leonardo DiCaprio", "Kate Winslet", "Billy Zane", "Gloria Stuart"],
    trailer: "https://www.youtube.com/watch?v=kVrqfYjkFsE",
    mainImage: "https://image.tmdb.org/t/p/w500/9xjZS2rlVxm8SFx8kPC3aIGCOYQ.jpg",
    movieFile: "https://www.youtube.com/watch?v=kVrqfYjkFsE",
    categories: ["Romance", "Drama"]
  },
  {
    name: "Forrest Gump",
    duration: 142,
    year: 1994,
    description: "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man.",
    director: "Robert Zemeckis",
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"],
    trailer: "https://www.youtube.com/watch?v=bLvqoHBptjg",
    mainImage: "https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
    movieFile: "https://www.youtube.com/watch?v=bLvqoHBptjg",
    categories: ["Drama", "Romance", "Comedy"]
  },
  {
    name: "The Avengers",
    duration: 143,
    year: 2012,
    description: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
    director: "Joss Whedon",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    trailer: "https://www.youtube.com/watch?v=eOrNdBpGMv8",
    mainImage: "https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg",
    movieFile: "https://www.youtube.com/watch?v=eOrNdBpGMv8",
    categories: ["Action", "Adventure", "Sci-Fi"]
  },
  {
    name: "Jurassic Park",
    duration: 127,
    year: 1993,
    description: "A pragmatic paleontologist visiting an almost complete theme park is tasked with protecting a couple of kids after a power failure causes the park's cloned dinosaurs to run loose.",
    director: "Steven Spielberg",
    cast: ["Sam Neill", "Laura Dern", "Jeff Goldblum", "Richard Attenborough"],
    trailer: "https://www.youtube.com/watch?v=lc0UehYemOA",
    mainImage: "https://image.tmdb.org/t/p/w500/b1xCNnyrPebIc7EWNZIa6BYzfuC.jpg",
    movieFile: "https://www.youtube.com/watch?v=lc0UehYemOA",
    categories: ["Adventure", "Sci-Fi", "Thriller"]
  },
  {
    name: "Saving Private Ryan",
    duration: 169,
    year: 1998,
    description: "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",
    director: "Steven Spielberg",
    cast: ["Tom Hanks", "Matt Damon", "Tom Sizemore", "Edward Burns"],
    trailer: "https://www.youtube.com/watch?v=9CiW_DgxCnQ",
    mainImage: "https://image.tmdb.org/t/p/w500/uqx37cS8cpHg8U35f9U5IBlrCV3.jpg",
    movieFile: "https://www.youtube.com/watch?v=9CiW_DgxCnQ",
    categories: ["War", "Drama", "Action"]
  },
  {
    name: "Apocalypse Now",
    duration: 147,
    year: 1979,
    description: "A U.S. Army officer serving in Vietnam is tasked with assassinating a renegade Special Forces Colonel who sees himself as a god.",
    director: "Francis Ford Coppola",
    cast: ["Martin Sheen", "Marlon Brando", "Robert Duvall", "Dennis Hopper"],
    trailer: "https://www.youtube.com/watch?v=FTjG-Aux_yI",
    mainImage: "https://image.tmdb.org/t/p/w500/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg",
    movieFile: "https://www.youtube.com/watch?v=FTjG-Aux_yI",
    categories: ["War", "Drama"]
  },
  {
    name: "The Sixth Sense",
    duration: 107,
    year: 1999,
    description: "A boy who communicates with spirits seeks the help of a disheartened child psychologist.",
    director: "M. Night Shyamalan",
    cast: ["Bruce Willis", "Haley Joel Osment", "Toni Collette", "Olivia Williams"],
    trailer: "https://www.youtube.com/watch?v=VG9AGf66tXM",
    mainImage: "https://image.tmdb.org/t/p/w500/4AfSDjjqTSYrJv4OjiouTwm2gPR.jpg",
    movieFile: "https://www.youtube.com/watch?v=VG9AGf66tXM",
    categories: ["Mystery", "Drama", "Thriller"]
  },
  {
    name: "Bohemian Rhapsody",
    duration: 134,
    year: 2018,
    description: "The story of the legendary British rock band Queen and lead singer Freddie Mercury, leading up to their famous performance at Live Aid.",
    director: "Bryan Singer",
    cast: ["Rami Malek", "Lucy Boynton", "Gwilym Lee", "Ben Hardy"],
    trailer: "https://www.youtube.com/watch?v=mP0VHJYFOAU",
    mainImage: "https://image.tmdb.org/t/p/w500/lHu1wtNaczFPGFDTrjCSzeLPTKN.jpg",
    movieFile: "https://www.youtube.com/watch?v=mP0VHJYFOAU",
    categories: ["Biography", "Drama", "Romance"]
  },
  {
    name: "The Social Network",
    duration: 120,
    year: 2010,
    description: "As Harvard student Mark Zuckerberg creates the social networking site that would become known as Facebook, he is sued by the twins who claimed he stole their idea.",
    director: "David Fincher",
    cast: ["Jesse Eisenberg", "Andrew Garfield", "Justin Timberlake", "Rooney Mara"],
    trailer: "https://www.youtube.com/watch?v=lB95KLmpLR4",
    mainImage: "https://image.tmdb.org/t/p/w500/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
    movieFile: "https://www.youtube.com/watch?v=lB95KLmpLR4",
    categories: ["Biography", "Drama"]
  },
  {
    name: "Superbad",
    duration: 113,
    year: 2007,
    description: "Two co-dependent high school seniors are forced to deal with separation anxiety after their plan to stage a booze-soaked party goes awry.",
    director: "Greg Mottola",
    cast: ["Jonah Hill", "Michael Cera", "Christopher Mintz-Plasse", "Bill Hader"],
    trailer: "https://www.youtube.com/watch?v=4eaZ_48ZYog",
    mainImage: "https://image.tmdb.org/t/p/w500/ek8e8txUyUwd2BNqj6lFEerJfbq.jpg",
    movieFile: "https://www.youtube.com/watch?v=4eaZ_48ZYog",
    categories: ["Comedy"]
  },
  {
    name: "The Hangover",
    duration: 100,
    year: 2009,
    description: "Three buddies wake up from a bachelor party in Las Vegas, with no memory of the previous night and the bachelor missing.",
    director: "Todd Phillips",
    cast: ["Bradley Cooper", "Ed Helms", "Zach Galifianakis", "Justin Bartha"],
    trailer: "https://www.youtube.com/watch?v=tcdUhdOlz9M",
    mainImage: "https://image.tmdb.org/t/p/w500/uluhlXqQpEwuN8BZuXdGH6PKnWa.jpg",
    movieFile: "https://www.youtube.com/watch?v=tcdUhdOlz9M",
    categories: ["Comedy"]
  },
  {
    name: "Casablanca",
    duration: 102,
    year: 1942,
    description: "A cynical expatriate American cafe owner struggles to decide whether or not to help his former lover and her fugitive husband escape the Nazis in French Morocco.",
    director: "Michael Curtiz",
    cast: ["Humphrey Bogart", "Ingrid Bergman", "Paul Henreid", "Claude Rains"],
    trailer: "https://www.youtube.com/watch?v=BkL9l7qovsE",
    mainImage: "https://image.tmdb.org/t/p/w500/5K7cOHoay2mZusSLezBOY0Qxh8a.jpg",
    movieFile: "https://www.youtube.com/watch?v=BkL9l7qovsE",
    categories: ["Romance", "Drama", "War"]
  },
  {
    name: "The Notebook",
    duration: 123,
    year: 2004,
    description: "A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.",
    director: "Nick Cassavetes",
    cast: ["Ryan Gosling", "Rachel McAdams", "James Garner", "Gena Rowlands"],
    trailer: "https://www.youtube.com/watch?v=4M7LIcH8C9U",
    mainImage: "https://image.tmdb.org/t/p/w500/rNzQyW4f8B8cQeg7Dgj3n6eT5k9.jpg",
    movieFile: "https://www.youtube.com/watch?v=4M7LIcH8C9U",
    categories: ["Romance", "Drama"]
  },
  {
    name: "Harry Potter and the Sorcerer's Stone",
    duration: 152,
    year: 2001,
    description: "An orphaned boy enrolls in a school of wizardry, where he learns the truth about himself, his family and the terrible evil that haunts the magical world.",
    director: "Chris Columbus",
    cast: ["Daniel Radcliffe", "Rupert Grint", "Emma Watson", "Richard Harris"],
    trailer: "https://www.youtube.com/watch?v=VyHV0BRtdxo",
    mainImage: "https://image.tmdb.org/t/p/w500/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
    movieFile: "https://www.youtube.com/watch?v=VyHV0BRtdxo",
    categories: ["Fantasy", "Adventure"]
  }
];

async function getAdminToken() {
  try {
    const response = await axios.post(`${API_URL}/tokens`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    return response.data.token;
  } catch (error) {
    console.error('Failed to get admin token:', error.response?.data || error.message);
    throw error;
  }
}

async function createCategory(categoryData, token) {
  try {
    const response = await axios.post(`${API_URL}/categories`, categoryData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Created category: ${categoryData.name}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response.data.error?.includes('already exists')) {
      console.log(`⚠️ Category already exists: ${categoryData.name}`);
      return null;
    }
    console.error(`❌ Failed to create category ${categoryData.name}:`, error.response?.data || error.message);
    throw error;
  }
}

async function getCategories(token) {
  try {
    const response = await axios.get(`${API_URL}/categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get categories:', error.response?.data || error.message);
    return [];
  }
}

async function createMovie(movieInfo, token, categoryMap) {
  try {
    const data = {
      name: movieInfo.name,
      duration: movieInfo.duration,
      year: movieInfo.year,
      description: movieInfo.description,
      director: movieInfo.director,
      cast: JSON.stringify(movieInfo.cast),
      mainImage: movieInfo.mainImage || '',
      movieFile: movieInfo.movieFile || ''
    };

    if (movieInfo.trailer) {
      data.trailer = movieInfo.trailer;
    }

    // Map category names to IDs
    const movieCategories = movieInfo.categories
      .map(categoryName => {
        const category = categoryMap[categoryName];
        return category ? { categoryId: category._id } : null;
      })
      .filter(Boolean);

    data.categories = JSON.stringify(movieCategories);

    // Use the new script endpoint
    const response = await axios.post(`${API_URL}/movies/script`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Created movie: ${movieInfo.name} (Categories: ${movieInfo.categories.join(', ')})`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to create movie ${movieInfo.name}:`, error.response?.data || error.message);
    throw error;
  }
}


async function main() {
  try {
    console.log('🔐 Getting admin token...');
    const token = await getAdminToken();

    console.log('📁 Creating categories...');
    const createdCategories = [];

    for (const categoryData of categoriesToCreate) {
      try {
        const category = await createCategory(categoryData, token);
        if (category) {
          createdCategories.push(category);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to create category ${categoryData.name}:`, error.message);
        continue;
      }
    }

    console.log('📋 Fetching all categories...');
    const allCategories = await getCategories(token);

    // Create category name to object mapping
    const categoryMap = {};
    allCategories.forEach(category => {
      categoryMap[category.name] = category;
    });

    console.log(`📽️ Starting to upload ${movieData.length} movies...`);

    for (let i = 0; i < movieData.length; i++) {
      try {
        await createMovie(movieData[i], token, categoryMap);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to upload movie ${i + 1}:`, error.message);
        continue;
      }
    }

    console.log('🎉 Upload completed!');
    console.log('\n📊 Summary:');
    console.log(`Categories created: ${categoriesToCreate.length}`);
    console.log(`Movies uploaded: ${movieData.length}`);
    console.log('\n🎬 Your ProjectFlix database is now populated with movies and categories!');

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

main();