CREATE MODEL lesson_quiz_generator  
PREDICT lesson_quiz  
USING  
engine = 'openai',  
max_tokens = 2048,  
temperature = 1,  
prompt_template = '  
Read everything below carefully:  
{{lesson_content}}

--------------------------------------------------------------------------

The paragraphs above is a part of the content of the lesson discussed by a
teacher in a class. The teacher wants to give the students an exercise based on
this lesson, and they are to take the exercise on a web app. Create a valid JSON
object containing {{questions_count}} questions (or less if that amount can not
possibly be generated) that the teacher can parse in the web app to create a
quiz for the students. The JSON must adhere strictly to the following format:

{
  "quizDetails": [
    {
      "question": "the question to be posed to the student",  
      "options": {  
        "A": "the first option the student can choose",  
        "B": "the second option the student can choose",  
        "C": "the third option the student can choose",  
        "D": "the fourth option the student can choose"  
      },  
      "answer": "the letter of the correct option. Must be one of A, B, C, D",  
      "explanation": "a brief explanation of why the option in the `answer`
      property is the valid answer to the question"
    }
  ]
}

Again, your response must be valid JSON, must be in the above format, and must
be based on the lesson contents you have read earlier. The questions, options,
and explanations should contain no line breaks. Also, make sure the answer
options are random. All questions should have options A, B, C, and D.

Again, your response must be valid JSON, must be in the above format, and the
answers to the questions must be in those paragraphs.

The RFC8259 compliant JSON containing the questions: ';
