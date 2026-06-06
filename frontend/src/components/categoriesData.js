import imgAddVocab from '../assets/categories/add_vocab.png';
import imgLists from '../assets/categories/lists.png';
import imgRandom from '../assets/categories/random.png';
import imgHangman from '../assets/categories/hangman.png';
import imgVisualMemory from '../assets/categories/visual_memory.png';
import imgSynAnt from '../assets/categories/syn_ant.png';
import imgListening from '../assets/categories/listening.png';
import imgWriting from '../assets/categories/writing.png';
import imgStats from '../assets/categories/stats.png';

export const categories = {
    "Learning & Management": [
        {
            title: "Add Vocabulary",
            description: "Add new vocabulary to your lists.",
            img: imgAddVocab,
            onClick: "create-word?listId=0",
        },
        {
            title: "Your Lists",
            description: "Review and edit your word collections. Check your progress and keep learning!",
            img: imgLists,
            onClick: "lists",
        }
    ],
    "Games & Practice": [
        {
            title: "Random Repetition",
            description: "Flashcards for quick review.",
            img: imgRandom,
            onClick: "/games/random",
        },
        {
            title: "Hangman",
            description: "Guess the hidden word.",
            img: imgHangman,
            onClick: "/games/hangman",
        },
        {
            title: "Visual Memory",
            description: "Match words with images.",
            img: imgVisualMemory,
            onClick: "games/visual-memory",
        },
        {
            title: "Synonyms & Antonyms",
            description: "Challenge your word relations.",
            img: imgSynAnt,
            onClick: "games/syn-ant",
        },
    ],
    "Skills & Media": [
        {
            title: "Listening Practice",
            description: "Train your ear with audio games.",
            img: imgListening,
            onClick: "games/listening",
        },
        {
            title: "Writing Skills",
            description: "Practice writing with AI feedback.",
            img: imgWriting,
            onClick: "games/writing",
        }
    ],
    "Analytics & Progress": [
        {
            title: "Performance Stats",
            description: "Detailed analytics of your learning journey.",
            img: imgStats,
            onClick: "statistics",
        }
    ]
};