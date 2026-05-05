export const categories = {
    "Learning & Management": [
        {
            title: "Add Vocabulary",
            description: "Add new vocabulary to your lists.",
            img: "https://i.postimg.cc/3wxkyDWH/unnamed_2_removebg_preview.png",
            onClick: "create-word?listId=0",
        },
        {
            title: "Your Lists",
            description: "Review and edit your word collections. Check your progress and keep learning!",
            img: "https://i.postimg.cc/JhzsyBtD/Gemini_Generated_Image_6916jg6916jg6916_removebg_preview.png",
            onClick: "lists",
        }
    ],
    "Games & Practice": [
        {
            title: "Random Repetition",
            description: "Flashcards for quick review.",
            img: "https://i.postimg.cc/N0jKyrLt/unnamed_4_removebg_preview.png",
            onClick: "/games/random",
        },
        {
            title: "Hangman",
            description: "Guess the hidden word.",
            img: "https://i.postimg.cc/k4jF6m7j/ahorcado.png",
            onClick: "/games/hangman",
        },
        {
            title: "Visual Memory",
            description: "Match words with images.",
            img: "https://i.postimg.cc/C1vHBgwc/imgg.png",
            onClick: "games/visual-memory",
        },
        {
            title: "Synonyms & Antonyms",
            description: "Challenge your word relations.",
            img: "https://i.postimg.cc/VNkJSb5k/unnamed_removebg_preview.png",
            onClick: "games/syn-ant",
        },
    ],
    "Skills & Media": [
        {
            title: "Listening Practice",
            description: "Train your ear with audio games.",
            img: "https://i.postimg.cc/fbRV30kb/Gemini_Generated_Image_1bj7k1bj7k1bj7k1_removebg_preview.png",
            onClick: "games/listening",
        },
        {
            title: "Writing Skills",
            description: "Practice writing with AI feedback.",
            img: "https://i.postimg.cc/rpwDdtzV/unnamed_5_removebg_preview.png",
            onClick: "games/writing",
        }
    ],
    "Analytics & Progress": [
        {
            title: "Performance Stats",
            description: "Detailed analytics of your learning journey.",
            img: "https://i.postimg.cc/GmmnTCs7/ac6500a5-c218-4ea7-8633-f26a599c7782-removebg-preview.png",
            onClick: "statistics",
        }
    ]
};