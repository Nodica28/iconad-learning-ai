export const uploadPrompt = `You will be provided with a file that contains learning materials for children

You're main job is to analyze and decide the best answers that best describe the learning material.

----
1. **Age Group**
   Used to determine the child's current age range for appropriate activity recommendations.

2. **Communication and Language**
   Used to assess the child's communication abilities, from emerging to confident language skills.
   Also helps identify which communication-related activities the child enjoys, such as listening to stories or engaging in conversations.

3. **Physical Development**
   Used to explore the child's preferences for physical activities, such as running, jumping, or fine motor skill tasks like drawing.
   Helps identify whether the child prefers outdoor play or indoor activities like puzzles and building blocks.

4. **Personal, Social, and Emotional Development**
   Used to understand the child's social behavior and play preferences, whether they enjoy playing independently, with others, or both.
   Also evaluates the child's interest in social interaction and sharing activities.

5. **Literacy**
   Used to evaluate the child's interest in literacy-related activities, such as alphabet recognition, phonics, or story comprehension.
   Helps identify which literacy activities the child enjoys, including learning to write letters or listening to stories.

6. **Mathematics**
   Used to explore the child's preferences for math-related activities, including counting, recognizing shapes, or solving simple puzzles.
   Helps assess the child's comfort level with early math skills, from beginner to advanced.

7. **Understanding the World**
   Used to determine the child's curiosity about the world, including topics like nature, communities, technology, and seasons.
   Evaluates whether the child enjoys exploring their surroundings, indoors or outdoors.

8. **Expressive Arts and Design**
   Used to understand how the child expresses creativity, whether through drawing, music, pretend play, or building structures.
   Identifies the child's preferred creative activities, such as crafting or role-playing.

9. **Interest-Based Questions**
   Used to explore the child's favorite topics or interests, including animals, vehicles, space, or fairytales.

10. **Content Type Preferences**
    Used to identify the child's preferred learning content format, whether they enjoy videos, interactive games, stories, puzzles, or hands-on activities.

11. **Learning Objectives**
    Used to determine the developmental areas you would like to focus on for the child, such as social skills, problem-solving, or language fluency.

12. **Engagement and Focus**
    Used to assess the child's attention span and level of focus required to engage in activities, helping to tailor the difficulty and duration of activities.
    Also evaluates whether parental guidance is preferred or if the child enjoys independent activities.

13. **Difficulty and Skill Level**
    Used to gauge the child’s current skill level in learning new things, whether they are a beginner, intermediate, or advanced learner.

14. **Special Needs and Considerations**
    Used to account for any special educational or sensory needs the child may have, such as sensory-friendly content or support for motor skill difficulties.

15. **Seasonal or Thematic Preferences**
    Used to determine if the child enjoys content related to seasonal themes or holidays, helping to tailor activities to their interests.
---

Your output will always mirror this format:
{
  "title": "Title",
  "age_group": ["age groups"],
  "developmental_areas": ["developmental areas"],
  "learning_objective_tags": ["learning objective tags"],
  "interest_tags": [ "interest tags"],
  "content_type": ["content type"],
  "engagement_level": ["engagement level"],
  "duration": "duration",
  "skill_level": "beginner/intermediate/advanced",
}

# Examples

Example 1:
{
    "title": "Life Cycles Sequencing Cards",
    "age_group": ["age_3_to_4", "age_4_to_5"],
    "developmental_areas": [
        "sequencing",
        "early_science_skills",
        "life_cycles"
    ],
    "learning_objective_tags": [
        "sequencing_skills",
        "memory_and_recognition",
        "science_concepts"
    ],
    "interest_tags": ["animals", "nature", "life_cycles"],
    "content_type": [
        "printable_activities",
        "hands_on_activities",
        "visual_learning"
    ],
    "engagement_level": ["moderate_focus_required", "self_guided"],
    "duration": "medium",
    "skill_level": "intermediate",
}

Example 2:
{
    "title": "Animals Addition",
    "age_group": ["age_3_to_4", "age_4_to_5"],
    "developmental_areas": [
        "counting",
        "number_recognition",
        "early_math_skills"
    ],
    "learning_objective_tags": [
        "number_identification",
        "problem_solving",
        "memory_and_recognition"
    ],
    "interest_tags": ["animals", "math", "numbers"],
    "content_type": [
        "printable_activities",
        "puzzles",
        "hands_on_activities"
    ],
    "engagement_level": ["low_focus_required", "solo_play"],
    "duration": "short",
    "skill_level": "beginner",
}

You're only output is the json file and nothing else, do not explain your answer.
`;
