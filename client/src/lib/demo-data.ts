// Demo responses for testing without backend
export const demoResponses: Record<string, string> = {
  default: `Based on the textbook content, here's a detailed explanation:

The concept you're asking about is fundamental to understanding this topic. Let me break it down step by step:

1. First, we need to understand the basic principles involved
2. Then, we can apply these principles to solve problems
3. Finally, we can see how this connects to other topics in your curriculum

This approach helps build a strong foundation for more advanced concepts you'll learn later.

Remember to practice regularly and refer to the examples in your textbook for better understanding.`,
  
  photosynthesis: `Photosynthesis is the process by which green plants make their own food using sunlight, water, and carbon dioxide.

The process occurs in two main stages:

1. Light Reaction (in thylakoids):
   - Chlorophyll absorbs sunlight
   - Water molecules split (photolysis)
   - Oxygen is released as a byproduct
   - Energy is stored in ATP and NADPH

2. Dark Reaction (in stroma):
   - Carbon dioxide is fixed
   - Glucose is synthesized using ATP and NADPH
   - This is also called the Calvin Cycle

The overall equation is:
6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂

This process is essential for life on Earth as it produces oxygen and forms the base of the food chain.`,

  pythagorean: `The Pythagorean theorem states that in a right-angled triangle, the square of the hypotenuse (the longest side) is equal to the sum of squares of the other two sides.

Formula: a² + b² = c²

Where:
- a and b are the two shorter sides (legs)
- c is the hypotenuse (longest side opposite the right angle)

Example:
If a triangle has sides of 3 cm and 4 cm, the hypotenuse will be:
3² + 4² = c²
9 + 16 = c²
25 = c²
c = 5 cm

This theorem is named after the Greek mathematician Pythagoras and is one of the most important concepts in geometry. It has numerous applications in construction, navigation, and physics.`,

  independence: `India gained independence from British rule on August 15, 1947, after a long struggle led by various freedom fighters and movements.

Key Events Leading to Independence:

1. First War of Independence (1857): Also called the Sepoy Mutiny, it was the first major uprising against British rule.

2. Formation of Indian National Congress (1885): Provided a platform for political discussions and demands.

3. Partition of Bengal (1905): Led to widespread protests and the Swadeshi movement.

4. Non-Cooperation Movement (1920-22): Led by Mahatma Gandhi, it involved boycotting British goods and institutions.

5. Civil Disobedience Movement (1930): Started with the famous Dandi March against the salt tax.

6. Quit India Movement (1942): A mass protest demanding immediate independence.

Important Leaders:
- Mahatma Gandhi (Father of the Nation)
- Jawaharlal Nehru (First Prime Minister)
- Sardar Vallabhbhai Patel
- Subhas Chandra Bose
- Bhagat Singh

The independence came with the partition of India and Pakistan, leading to one of the largest mass migrations in history.`
}

export const exampleQuestions = [
  "What is photosynthesis?",
  "Explain the Pythagorean theorem",
  "How did India gain independence?",
  "What are Newton's laws of motion?",
  "Explain the water cycle"
]

export function getDemoResponse(question: string): string {
  const lowerQuestion = question.toLowerCase()
  
  if (lowerQuestion.includes("photosynthesis") || lowerQuestion.includes("plant")) {
    return demoResponses.photosynthesis
  }
  
  if (lowerQuestion.includes("pythagorean") || lowerQuestion.includes("theorem") || lowerQuestion.includes("triangle")) {
    return demoResponses.pythagorean
  }
  
  if (lowerQuestion.includes("independence") || lowerQuestion.includes("freedom") || lowerQuestion.includes("british")) {
    return demoResponses.independence
  }
  
  return demoResponses.default
}
