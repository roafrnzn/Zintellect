import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";

export const POST: RequestHandler = async ({ request }) => {
  const ollama = new Ollama({ host: "http://localhost:11434/" });

  const dataOfUser = {
    name: "Franzine Benneth C. Roa",
    birthday: "December 6, 2003",
    nickname: ["Franz","Zin"],
    age: "21",
    status: "Single",
    course: "Bachelor of Science in Computer Science",
    nationality: "Filipino",
    school: "Gordon College",
    languagesSpoken: ["English", "Filipino", "Korean"],
    zodiacSign: "Sagittarius",
    bloodType: "O",
    hobbies: ["Reading Manhwas", "Listening to Music", "Watching K-Dramas/C-Dramas"],
    mbti: "INFJ-T",
    favoriteColors: ["Purple", "Red", "Black"],
    favoriteMovie: "The Devil Wears Prada",
    favoriteSongs: "Kidult",
    favoriteArtists: ["EXO", "NCT", "SVT", "aespa", "GOT7", "Red Velvet"],
    favoriteTVShows: ["Our Beloved Summer","Twinkling Watermelon", "The Best Thing"],
    favoriteGenre: ["Rom-Com", "Action"],
    favoriteFoods: ["Carbonara", "French Fries", "Lasagna"],
    dreamJob: ["Data Analyst", "UI/UX Designer", "QA Tester"],
    petPeeves: ["Loud Chewing/Slurping", "Incorrect Grammar", "Fake Apologies"],
    motto: "You own your life. Don't be swayed by distractions and lose sight of what truly matters—just focus on yourself.",
    userType: "Master User"
  };

  try {
    const { message } = await request.json()
    
    const chat = await ollama.chat({
      model: "deepseek-r1:1.5b",
      messages: [
        {
          role: "system",
          content: `Hi, I'm Franzine. Here is my data: ${JSON.stringify(dataOfUser)} 
                    Respond only based on the data of the master user.
                    Keep responses short. Respond naturally, like a human would.`,
        },
        { role: "user", content: message },
      ],
    })
    
    return json({ response: chat.message.content })
  } catch (error) {
    console.error("Ollama API Error:", error)
    return json({ error: "Failed to fetch response from Ollama." }, { status: 500 })
  }
}