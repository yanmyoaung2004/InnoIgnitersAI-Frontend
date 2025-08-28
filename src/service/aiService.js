import axios from "axios";

export async function generateQuestions(count = 5) {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_NGROK_URL}/generate`,
      {
        num_questions: count,
      }
    );
    const generatedQuestions = response.data.questions;

    return {
      questions: generatedQuestions.slice(0, count),
      success: true,
      message: `Successfully generated ${count} questions`,
    };
  } catch (error) {
    console.log(error);
  }
}
