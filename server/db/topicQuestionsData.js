
const topicQuestions = [
  {
    skill: "Programming Fundamentals & OOP",
    topic: "Introduction to Programming",
    questions: [
      {
        prompt: "What is a computer program?",
        options: [
          "A set of instructions executed by a computer",
          "A physical computer component",
          "A type of internet connection",
          "A computer monitor"
        ],
        correctIndex: 0,
        explanation: "A program is a sequence of instructions that a computer can execute.",
        difficulty: 1
      },
      {
        prompt: "What is the primary purpose of programming?",
        options: [
          "To increase computer size",
          "To instruct computers to perform tasks",
          "To replace computer hardware",
          "To manufacture processors"
        ],
        correctIndex: 1,
        explanation: "Programming allows us to define instructions that computers execute to solve problems.",
        difficulty: 1
      },
      {
        prompt: "What is an algorithm?",
        options: [
          "A programming language",
          "A computer virus",
          "A finite sequence of steps for solving a problem",
          "A hardware device"
        ],
        correctIndex: 2,
        explanation: "An algorithm describes a finite, well-defined sequence of steps to accomplish a task.",
        difficulty: 1
      },
      {
        prompt: "What is pseudocode?",
        options: [
          "Code written only in Python",
          "A visual programming language",
          "Machine-readable binary code",
          "An informal description of algorithm steps"
        ],
        correctIndex: 3,
        explanation: "Pseudocode describes program logic without requiring strict programming-language syntax.",
        difficulty: 1
      },
      {
        prompt: "Which of these is a programming language?",
        options: [
          "Python",
          "HTML",
          "HTTP",
          "USB"
        ],
        correctIndex: 0,
        explanation: "Python is a general-purpose programming language. HTML is a markup language.",
        difficulty: 1
      },
      {
        prompt: "What does a compiler typically do?",
        options: [
          "Deletes source code",
          "Translates source code into another form before execution",
          "Only displays program output",
          "Connects a computer to Wi-Fi"
        ],
        correctIndex: 1,
        explanation: "A compiler translates source code into target code, such as machine code or bytecode.",
        difficulty: 2
      },
      {
        prompt: "Which statement best describes an interpreter?",
        options: [
          "It is always a hardware device",
          "It only works with C",
          "It executes or evaluates program instructions through an interpreter",
          "It permanently stores files"
        ],
        correctIndex: 2,
        explanation: "An interpreter executes or evaluates program instructions rather than requiring a separately produced executable.",
        difficulty: 2
      },
      {
        prompt: "What is source code?",
        options: [
          "The electrical power supplied to a computer",
          "The final screen displayed by a program",
          "A processor's physical design",
          "Human-readable program instructions"
        ],
        correctIndex: 3,
        explanation: "Source code contains program instructions written in a programming language.",
        difficulty: 1
      },
      {
        prompt: "What is a syntax error?",
        options: [
          "A violation of a programming language's grammar rules",
          "A slow internet connection",
          "An incorrect algorithmic result despite valid code",
          "A broken keyboard"
        ],
        correctIndex: 0,
        explanation: "Syntax errors occur when code does not follow the language's grammar.",
        difficulty: 2
      },
      {
        prompt: "What is a logical error?",
        options: [
          "A missing software installation",
          "A mistake that causes a program to produce incorrect behavior",
          "An error caused only by hardware failure",
          "An invalid file extension"
        ],
        correctIndex: 1,
        explanation: "A logical error happens when the program runs but its logic produces unintended results.",
        difficulty: 2
      },
      {
        prompt: "What is the purpose of a development environment?",
        options: [
          "To increase internet bandwidth",
          "To replace the operating system",
          "To provide tools for writing, running, and debugging code",
          "To manufacture computer chips"
        ],
        correctIndex: 2,
        explanation: "Development environments provide tools such as editors, terminals, debuggers, and language runtimes.",
        difficulty: 1
      },
      {
        prompt: "Which sequence best represents a basic programming workflow?",
        options: [
          "Deploy, guess, delete",
          "Write code, ignore errors, finish",
          "Install hardware, format disk, restart",
          "Understand the problem, design, implement, test"
        ],
        correctIndex: 3,
        explanation: "A good workflow begins with understanding the problem and continues through design, implementation, and testing.",
        difficulty: 2
      },
      {
        prompt: "Consider this pseudocode: x = 4; y = 3; PRINT x + y. What is printed?",
        options: [
          "7",
          "43",
          "12",
          "1"
        ],
        correctIndex: 0,
        explanation: "The plus operator adds the two numeric values, giving 7.",
        difficulty: 2
      },
      {
        prompt: "An algorithm checks numbers from 1 through 5 and prints only even numbers. What is the output?",
        options: [
          "1, 3, 5",
          "2, 4",
          "1, 2, 3, 4, 5",
          "4, 5"
        ],
        correctIndex: 1,
        explanation: "Only 2 and 4 are divisible by 2 without a remainder.",
        difficulty: 3
      },
      {
        prompt: "Why should a programmer test a program with different inputs?",
        options: [
          "To guarantee that no bug can ever exist",
          "To make source code longer",
          "To discover incorrect behavior and edge cases",
          "To avoid understanding the algorithm"
        ],
        correctIndex: 2,
        explanation: "Testing with varied inputs helps identify defects and unexpected behavior, although it cannot guarantee the absence of all bugs.",
        difficulty: 3
      }
    ]
  }
];

module.exports = { topicQuestions };
